import express from "express";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import gameRoutes from "./routes/game.js";
import { WebSocketServer } from "ws";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.json());

app.use("/", gameRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
const clients = new Map();
const lobby = [];
const games = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "join") {
      console.log(data);
      const playerId = data.playerId;
      console.log(`${playerId} joining the lobby`);
      clients.set(playerId, ws);
      lobby.push(playerId);
      ws.send(
        JSON.stringify({
          type: "init",
          status: "waiting",
          foundArr: Array(5).fill(false),
        }),
      );
      console.log("Lobby: ", lobby);

      if (lobby.length > 1) {
        const player1 = lobby.shift();
        const player2 = lobby.shift();
        const gameId = `game-${uuidv4()}`;
        games.set(gameId, {
          players: [player1, player2],
          foundArr: Array(5).fill(false),
        });
        console.log(`Paired ${player1} and ${player2} in ${gameId}`);
        console.log(lobby);

        const ws1 = clients.get(player1);
        const ws2 = clients.get(player2);
        ws1.send(
          JSON.stringify({ type: "paired", gameId, opponentId: player2 }),
        );
        ws2.send(
          JSON.stringify({ type: "paired", gameId, opponentId: player1 }),
        );
      }
    }

    if (data.type === "updateFound") {
      let game = null;
      for (const [id, gameData] of games) {
        if (gameData.players.includes(data.playerId)) {
          game = gameData;
          game.foundArr = data.foundArr;
          break;
        }
      }

      if (game) {
        const opponentsId = game.players.find((id) => id !== data.playerId);
        const opponentsWs = clients.get(opponentsId);
        const playersWs = clients.get(data.playerId);
        if (opponentsWs?.readyState === opponentsWs.OPEN) {
          opponentsWs.send(
            JSON.stringify({ type: "updateFound", foundArr: game.foundArr }),
          );
        }

        if (!game.foundArr.includes(false)) {
          console.log(`Game ${data.gameId} over: all found`);
          if (opponentsWs?.readyState === opponentsWs.OPEN) {
            opponentsWs.send(
              JSON.stringify({ type: "gameOver", reason: "allFound" }),
            );
          }
          if (playersWs?.readyState === playersWs.OPEN) {
            playersWs.send(
              JSON.stringify({ type: "gameOver", reason: "allFound" }),
            );
          }
        }
      }
    }

    // End Of WebSocket Messages
  });

  ws.on("close", () => {
    const playerId = [...clients].find(([id, client]) => client === ws)?.[0];
    if (playerId) {
      clients.delete(playerId);
      const index = lobby.indexOf(playerId);
      if (index !== -1) lobby.splice(index, 1);

      let gameIdToRemove;

      for (const [gameId, game] of games) {
        if (game.players.includes(playerId)) {
          gameIdToRemove = gameId;
          const opponentId = game.players.find((id) => id !== playerId);
          const opponentWs = clients.get(opponentId);
          if (opponentWs?.readyState === opponentWs.OPEN) {
            opponentWs.send(JSON.stringify({ type: "opponentQuit", gameId }));
            lobby.push(opponentId);
            opponentWs.send(
              JSON.stringify({ type: "init", foundArr: Array(5).fill(false) }),
            );
          }
          break;
        }
      }
      if (gameIdToRemove) games.delete(gameIdToRemove);
    }
  });
});
