import { v4 as uuidv4 } from "uuid";

export function setupWebSocket( wss, clients, lobby, games,
    GAME_DURATION, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR,) {
  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const { type, playerId, foundArr, powerUpsArr, character } = data;

      if (type === "join") {
        clients.set(playerId, ws);
        lobby.push(playerId);
        wsOpenSend(ws, {
          type: "init",
          foundArr: DEFAULT_FOUND_ARR,
          powerUpsArr: DEFAULT_POWERUPS_ARR,
        });
        console.log("Lobby:", lobby);

        if (lobby.length > 1) {
          const player1 = lobby.shift();
          const player2 = lobby.shift();
          const gameId = `game-${uuidv4()}`;
          games.set(gameId, {
            players: [player1, player2],
            foundArr: DEFAULT_FOUND_ARR,
            powerUpsArr: DEFAULT_POWERUPS_ARR,
            startTime: Date.now(),
          });

          const ws1 = clients.get(player1);
          const ws2 = clients.get(player2);

          const { foundArr, powerUpsArr, startTime } = games.get(gameId);

          wsOpenSend(ws1, {
            type: "paired",
            gameId,
            opponentId: player2,
            foundArr: foundArr,
            powerUpsArr: powerUpsArr,
            startTime: startTime,
          });
          wsOpenSend(ws2, {
            type: "paired",
            gameId,
            opponentId: player1,
            foundArr: foundArr,
            powerUpsArr: powerUpsArr,
            startTime: startTime,
          });

          setTimeout(() => {
            const game = games.get(gameId);
            if (game && Date.now() - game.startTime >= GAME_DURATION) {
              wsOpenSend(ws1, { type: "gameOver", reason: "timeUp" });
              wsOpenSend(ws2, { type: "gameOver", reason: "timeUp" });
              games.delete(gameId);
            }
          }, GAME_DURATION);
        }
      }

      if (type === "updateFound") {
        let { gameId, gameData } = getGameByPlayerId(playerId, games);

        if (gameData) {
          gameData.foundArr = foundArr;
          const { opponentsWs, playersWs } = getGameWsByPlayerId( playerId, gameData, clients,);
          wsOpenSend(opponentsWs, { type: "updateFound", foundArr: gameData.foundArr, });

          /* check if all wallys have been found */
          if (!gameData.foundArr.includes(false)) {
            wsOpenSend(opponentsWs, { type: "gameOver", reason: "allFound" });
            wsOpenSend(playersWs, { type: "gameOver", reason: "allFound" });
            games.delete(gameId);
          }
        }
      }

      if (type === "powerUpFound") {
        let { gameData } = getGameByPlayerId(playerId, games);

        if (gameData) {
          gameData.powerUpsArr = powerUpsArr;
          const { opponentsWs, playersWs } = getGameWsByPlayerId( playerId, gameData, clients,);
          wsOpenSend(opponentsWs, { type: "powerUpFound", powerUpsArr: powerUpsArr, character });
        }
      }
    });

    ws.on("close", () => {
      const playerId = [...clients].find(([id, client]) => client === ws)?.[0];
      if (playerId) {
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
        const opponentWs = clients.get(opponentId);
        wsOpenSend(opponentWs, { type: "opponentQuit", gameId });
        if (opponentWs?.readyState === opponentWs.OPEN) lobby.push(opponentId);
        wsOpenSend(opponentWs, {
          type: "init",
          foundArr: DEFAULT_FOUND_ARR,
        });
        games.delete(gameId);
      }
    });
  });
}

const wsOpenSend = (ws, jsonData) => {
  if (ws?.readyState === ws.OPEN) ws.send(JSON.stringify(jsonData));
};

function getGameByPlayerId(playerId, games) {
  for (const [id, gameData] of games) {
    if (gameData.players.includes(playerId)) {
      return { gameId: id, gameData };
    }
  }
}

function getGameWsByPlayerId(playerId, gameData, clients) {
  const opponentsId = gameData.players.find((id) => id !== playerId);
  const opponentsWs = clients.get(opponentsId);
  const playersWs = clients.get(playerId);

  return { opponentsWs, playersWs };
}
