import { v4 as uuidv4 } from "uuid";
import {
  getGameByPlayerId,
  getGameWsByPlayerId,
  wsOpenSend,
} from "./utils/utils.js";

export function setupWebSocket(
  wss,
  clients,
  lobby,
  games,
  GAME_DURATION,
  DEFAULT_FOUND_ARR,
  DEFAULT_POWERUPS_ARR,
) {
  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const { type, playerId, playerStats } = data;

      if (type === "join") {
        clients.set(playerId, ws);
        lobby.push(playerId);
        console.log(lobby);

        if (lobby.length > 1) {
          const player1 = lobby.shift();
          const player2 = lobby.shift();
          const gameId = `game-${uuidv4()}`;
          games.set(gameId, {
            players: [player1, player2],
            foundArr: DEFAULT_FOUND_ARR(),
            powerUpsArr: DEFAULT_POWERUPS_ARR(),
            startTime: Date.now(),
            playerStats: {
              [player1]: { wallysFound: 0, activeEffect: [] },
              [player2]: { wallysFound: 0, activeEffect: [] },
            },
          });

          const ws1 = clients.get(player1);
          const ws2 = clients.get(player2);

          const { foundArr, powerUpsArr, startTime, playerStats } = games.get(
            gameId,
            data,
          );

          wsOpenSend([ws1, ws2], {
            type: "paired",
            gameId,
            foundArr,
            powerUpsArr,
            startTime,
            playerStats,
          });

          setTimeout(() => {
            const game = games.get(gameId);
            if (game && Date.now() - game.startTime >= GAME_DURATION) {
              wsOpenSend([ws1, ws2], { type: "gameOver", reason: "timeUp" });
              games.delete(gameId);
            }
          }, GAME_DURATION);
        }
      }

      if (type === "activeEffectUpdate") {

        const result = getGameByPlayerId(playerId, games);

        if (!result || !result.gameData) {
          console.warn(`No game found for playerId ${playerId} in activeEffectUpdate`,); 
          return;
        }

        const { gameData } = result;
        gameData.playerStats = playerStats;
        const { playersWs, opponentsWs } = getGameWsByPlayerId(playerId, gameData, clients);
        if (!wsOpenSend([playersWs, opponentsWs], { type: "activeEffectUpdate", playerStats, })) 
            console.warn(`Failed to send activeEffectUpdate to opponent for playerId ${playerId}`);
        
      }
    });

    ws.on("close", () => {
      const playerId = [...clients].find(([id, client]) => client === ws)?.[0];
      if (!playerId) {
        console.log("No playerId found for closed WebSocket");
        return;
      }

      clients.delete(playerId);
      const index = lobby.indexOf(playerId);
      if (index !== -1) lobby.splice(index, 1);

      const result = getGameByPlayerId(playerId, games);
      if (!result) {
        console.log("No game found for closing  player:", playerId);
        return;
      }

      const { gameId, gameData } = result;
      const opponentId = gameData.players.find((id) => id !== playerId);

      if (!opponentId) {
        console.log(`No opponent found for game ${gameId}`);
        games.delete(gameId);
        return;
      }

      const opponentWs = clients.get(opponentId);
      if (
        opponentWs &&
        wsOpenSend([opponentWs], { type: "opponentQuit", gameId })
      ) {
        console.log(`Notified opponent ${opponentId} of quit game ${gameId}`);
        lobby.push(opponentId);
      } else {
        console.warn(`Opponent ${opponentId} unavailable for game ${gameId}`);
        clients.delete(opponentId);
      }

      games.delete(gameId);
    });
  });
}
