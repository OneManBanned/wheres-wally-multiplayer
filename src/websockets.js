import { v4 as uuidv4 } from "uuid";
import { getGameByPlayerId, wsOpenSend } from "./utils/utils.js";

export function setupWebSocket( wss, clients, lobby, games, GAME_DURATION, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR,
) {

  wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      const { type, playerId } = data;

      if (type === "join") {
        clients.set(playerId, ws);
        lobby.push(playerId);

        if (lobby.length > 1) {
          const player1 = lobby.shift();
          const player2 = lobby.shift();
          const gameId = `game-${uuidv4()}`;
          games.set(gameId, { players: [player1, player2], foundArr: DEFAULT_FOUND_ARR(), powerUpsArr: DEFAULT_POWERUPS_ARR(),
            startTime: Date.now(), playerStats: { [player1]: { wallysFound: 0 }, [player2]: { wallysFound: 0 }, },
          });

          const ws1 = clients.get(player1);
          const ws2 = clients.get(player2);

          const { foundArr, powerUpsArr, startTime, playerStats } = games.get(gameId, data);

          wsOpenSend(ws1, { type: "paired", gameId, foundArr, powerUpsArr, startTime, playerStats });
          wsOpenSend(ws2, { type: "paired", gameId, foundArr, powerUpsArr, startTime, playerStats });

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
        lobby.push(opponentId);
        games.delete(gameId);
      }
    });
  });
}

