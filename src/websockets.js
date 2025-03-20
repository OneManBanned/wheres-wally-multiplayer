import { v4 as uuidv4 } from "uuid";

export function setupWebSocket(wss, clients, lobby, games) {
  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const { type, playerId, foundArr } = data;

      if (type === "join") {
        clients.set(playerId, ws);
        lobby.push(playerId);
        wsOpenSend(ws, {
          type: "init",
          status: "waiting",
          foundArr: Array(5).fill(false),
        });
        console.log("Lobby:", lobby);

        if (lobby.length > 1) {
          const player1 = lobby.shift();
          const player2 = lobby.shift();
          const gameId = `game-${uuidv4()}`;
          games.set(gameId, {
            players: [player1, player2],
            foundArr: Array(5).fill(false),
            startTime: Date.now(),
          });

          const ws1 = clients.get(player1);
          const ws2 = clients.get(player2);

          wsOpenSend(ws1, {
            type: "paired",
            gameId,
            opponentId: player2,
            foundArr: games.get(gameId).foundArr,
            startTime: games.get(gameId).startTime,
          });
          wsOpenSend(ws2, {
            type: "paired",
            gameId,
            opponentId: player1,
            foundArr: games.get(gameId).foundArr,
            startTime: games.get(gameId).startTime,
          });

          setTimeout(() => {
            const game = games.get(gameId);
            if (game && Date.now() - game.startTime >= 300000) {
              wsOpenSend(ws1, { type: "gameOver", reason: "timeUp" });
              wsOpenSend(ws2, { type: "gameOver", reason: "timeUp" });
              games.delete(gameId);
            }
          }, 300000); // 5 minutes
        }
      }

      if (type === "updateFound") {
        console.log(playerId);
        let { gameId, gameData } = getGameByPlayerId(playerId, games);
        console.log(gameId, gameData);

        if (gameData) {
          gameData.foundArr = foundArr;
          const opponentsId = gameData.players.find((id) => id !== playerId);
          const opponentsWs = clients.get(opponentsId);
          const playersWs = clients.get(playerId);

          wsOpenSend(opponentsWs, {
            type: "updateFound",
            foundArr: gameData.foundArr,
          });
          /* check if all wallys have been found */
          if (!gameData.foundArr.includes(false)) {
            wsOpenSend(opponentsWs, { type: "gameOver", reason: "allFound" });
            wsOpenSend(playersWs, { type: "gameOver", reason: "allFound" });
            games.delete(gameId);
          }
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
            console.log("No game found for closing  player:", playerId)
            console.log("Lobby at close", lobby)
            return;
        }
          const { gameId, gameData } = result;

        const opponentId = gameData.players.find((id) => id !== playerId);
        const opponentWs = clients.get(opponentId);
        wsOpenSend(opponentWs, { type: "opponentQuit", gameId });
        if (opponentWs?.readyState === opponentWs.OPEN) lobby.push(opponentId);
        wsOpenSend(opponentWs, {
          type: "init",
          foundArr: Array(5).fill(false),
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
