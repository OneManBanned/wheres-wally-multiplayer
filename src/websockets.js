import { v4 as uuidv4 } from "uuid";

export function setupWebSocket(wss, clients, lobby, games) {
  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const { type, playerId, foundArr } = data;

      if (type === "join") {
        clients.set(playerId, ws);
        lobby.push(playerId);
        sendIfWsOpen(ws, {
          type: "init",
          status: "waiting",
          foundArr: Array(5).fill(false),
        });

        if (lobby.length > 1) {
          const player1 = lobby.shift();
          const player2 = lobby.shift();
          const gameId = `game-${uuidv4()}`;
          games.set(gameId, {
            players: [player1, player2],
            foundArr: Array(5).fill(false),
          });

          const ws1 = clients.get(player1);
          const ws2 = clients.get(player2);
          sendIfWsOpen(ws1, {
            type: "paired",
            gameId,
            opponentId: player2,
            foundArr: games.get(gameId).foundArr,
            startTime: Date.now(),
          });
          sendIfWsOpen(ws2, {
            type: "paired",
            gameId,
            opponentId: player1,
            foundArr: games.get(gameId).foundArr,
            startTime: Date.now(),
          });

          setTimeout(() => {
            const game = games.get(gameId);
            if (game && Date.now() - game.startTime >= 300000) {
              sendIfWsOpen(ws1, { type: "gameOver", reason: "timeUp" });
              sendIfWsOpen(ws2, { type: "gameOver", reason: "timeUp" });
              games.delete(gameId);
            }
          }, 300000); // 5 minutes
        }
      }

      if (type === "updateFound") {
        let { gameData } = getGameByPlayerId(playerId, games);
        gameData.foundArr = foundArr;

        if (gameData) {
          const opponentsId = gameData.players.find((id) => id !== playerId);
          const opponentsWs = clients.get(opponentsId);
          const playersWs = clients.get(playerId);

          sendIfWsOpen(opponentsWs, {
            type: "updateFound",
            foundArr: gameData.foundArr,
          });
          /* check if all wallys have been found */
          if (!gameData.foundArr.includes(false)) {
            sendIfWsOpen(opponentsWs, { type: "gameOver", reason: "allFound" });
            sendIfWsOpen(playersWs, { type: "gameOver", reason: "allFound" });
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

        let gameIdToRemove;

        for (const [gameId, game] of games) {
          console.log("Close:", gameId);
          if (game.players.includes(playerId)) {
            gameIdToRemove = gameId;
            const opponentId = game.players.find((id) => id !== playerId);
            const opponentWs = clients.get(opponentId);
            if (opponentWs?.readyState === opponentWs.OPEN) {
              opponentWs.send(JSON.stringify({ type: "opponentQuit", gameId }));
              lobby.push(opponentId);
              opponentWs.send(
                JSON.stringify({
                  type: "init",
                  foundArr: Array(5).fill(false),
                }),
              );
            }
            break;
          }
        }
        if (gameIdToRemove) games.delete(gameIdToRemove);
      }
    });
  });
}

const sendIfWsOpen = (ws, jsonData) => {
  if (ws?.readyState === ws.OPEN) ws.send(JSON.stringify(jsonData));
};

function getGameByPlayerId(playerId, games) {
  for (const [id, gameData] of games) {
    if (gameData.players.includes(playerId)) {
      return { gameId: id, gameData };
    }
  }
}
