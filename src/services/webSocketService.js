import { WS_MESSAGE_TYPES } from "../constants.js";
import { wsOpenSend } from "../utils/utils.js";

export class WebSocketService {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  sendToGamePlayers(gameId, message) {
    const game = this.stateManager.getGame(gameId);
    if (!game) return false;

    const clients = game.players
      .map((id) => this.stateManager.getClient(id))
      .filter(Boolean);

    if (!clients.length) return false;

    wsOpenSend(clients, message);
    return true;
  }

  sendPairedMessage(gameId, gameData) {
    const { foundArr, powerUpsArr, startTime, playerStats } = gameData;
    return this.sendToGamePlayers(gameId, {
      type: WS_MESSAGE_TYPES.PAIRED,
      gameId,
      foundArr,
      powerUpsArr,
      startTime,
      playerStats,
    });
  }

  sendGameOver(gameId, reason) {
    const game = this.stateManager.getGame(gameId);
    return this.sendToGamePlayers(gameId, {
      type: WS_MESSAGE_TYPES.GAME_OVER,
      reason,
      game
    });
  }

  sendOpponentQuit(opponentId, gameId) {
    const opponentWs = this.stateManager.getClient(opponentId);
    if (!opponentWs) return false;

    wsOpenSend([opponentWs], {
      type: WS_MESSAGE_TYPES.OPPONENT_QUIT,
      gameId,
    });

    return true;
  }
}
