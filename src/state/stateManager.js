export class StateManager {
  #games = new Map();
  #clients = new Map();
  #lobby = [];
  #effectTimeouts = new Map();

  getGame(gameId) {
    return this.#games.get(gameId);
  }

  getGameByPlayerId(playerId) {
    for (const [gameId, game] of this.#games) {
      if (game.players.includes(playerId)) {
        return { gameId, gameData: game };
      }
    }
    return null;
  }

  addGame(gameId, gameData) {
    this.#games.set(gameId, gameData);
  }

  removeGame(gameId) {
    this.#games.delete(gameId);
  }

  getClient(playerId) {
    return this.#clients.get(playerId);
  }

  addClient(playerId, ws) {
    this.#clients.set(playerId, ws);
  }

  removeClient(playerId) {
    this.#clients.delete(playerId);
  }

  getClientByWs(ws) {
    for (const [playerId, client] of this.#clients) {
      if (client === ws) {
        return playerId;
      }
    }
    return null;
  }

  addToLobby(playerId) {
    if (!this.#lobby.includes(playerId)) {
      this.#lobby.push(playerId);
    }
  }

  removeFromLobby(playerId) {
    const index = this.#lobby.indexOf(playerId);
    if (index !== -1) {
      this.#lobby.splice(index, 1);
    }
  }

  getLobby() {
    return this.#lobby;
  }

  shiftLobby(count) {
    return this.#lobby.splice(0, count);
  }

  getEffectTimeout(effectId) {
    return this.#effectTimeouts.get(effectId);
  }

  setEffectTimeout(effectId, timeout) {
    this.#effectTimeouts.set(effectId, timeout);
  }

  removeEffectTimeout(effectId) {
    const timeout = this.#effectTimeouts.get(effectId);
    if (timeout) {
      clearTimeout(timeout);
      this.#effectTimeouts.delete(effectId);
    }
  }

  clearEffectTimeoutsForPlayer(game) {
      game.players.forEach(playerId => {
          const activeEffects = game.playerStats?.[playerId]?.activeEffects || [];
          activeEffects.forEach(effect => {
              this.removeEffectTimeout(effect.effectId)
          })
      })
  }
}
