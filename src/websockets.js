import { GameService } from "./services/gameService.js";
import { EffectService } from "./services/effectService.js";
import { WebSocketService } from "./services/webSocketService.js";
import { WS_MESSAGE_TYPES, GAME_OVER_REASONS, GAME_DURATION, } from "./constants.js";

export function setupWebSocket(wss, stateManager, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR) {
  const webSocketService = new WebSocketService(stateManager);
  const effectService = new EffectService(stateManager, webSocketService);
  const gameService = new GameService(stateManager, effectService, webSocketService);

  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch (error) {
        console.warn(`Invalid WebSocket message: ${error.message}`);
        return;
      }

      const { type, playerId } = data;

      if (typeof playerId !== "string" || !playerId) {
        console.warn("Missing or invalid playerId");
        return;
      }

      if (type === WS_MESSAGE_TYPES.JOIN) {
        if (stateManager.getClient(playerId)) {
          console.warn(`Player ${playerId} already connected`);
          return;
        }

        stateManager.addClient(playerId, ws);
        stateManager.addToLobby(playerId);

        if (stateManager.getLobby().length > 1) {
          const [player1, player2] = stateManager.shiftLobby(2);
          const { gameId } = gameService.createGame(
            player1,
            player2,
            DEFAULT_FOUND_ARR,
            DEFAULT_POWERUPS_ARR
          );

          setTimeout(() => {
            const game = stateManager.getGame(gameId);
            if (game && Date.now() - game.startTime >= GAME_DURATION) {
              webSocketService.sendGameOver(gameId, GAME_OVER_REASONS.TIME_UP);
              gameService.cleanupGame(gameId);
            }
          }, GAME_DURATION);
        }
      } else if (type === WS_MESSAGE_TYPES.GAME_TIMEOUT) {
        const result = stateManager.getGameByPlayerId(playerId);
        if (result) {
          const { gameId } = result;
          webSocketService.sendGameOver(gameId, GAME_OVER_REASONS.TIME_UP);
          gameService.cleanupGame(gameId);
        }
      } else {
        console.warn(`Unknown message type: ${type}`);
      }
    });

    ws.on("close", () => {
      const playerId = stateManager.getClientByWs(ws);
      if (!playerId) {
        console.log("No playerId found for closed WebSocket");
        return;
      }

      stateManager.removeClient(playerId);
      stateManager.removeFromLobby(playerId);

      const result = stateManager.getGameByPlayerId(playerId);
      if (!result) return;

      const { gameId, gameData } = result;
      const opponentId = gameData.players.find((id) => id !== playerId);

      if (opponentId && webSocketService.sendOpponentQuit(opponentId, gameId)) {
        stateManager.addToLobby(opponentId);
      } else if (!opponentId) {
        stateManager.removeGame(gameId);
      } else {
        stateManager.removeClient(opponentId);
      }

      gameService.cleanupGame(gameId);
    });
  });
}
