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
  let foundArr = Array(5).fill(false);

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "join") {
      console.log(data);
      const playerId = data.playerId;
      console.log(`${playerId} joining the lobby`);
      clients.set(playerId, ws);
      lobby.push(playerId);
      ws.send(JSON.stringify({ type: "init", foundArr, status: "waiting" }));
      console.log("Lobby: ", lobby);

      if (lobby.length > 1) {
        const player1 = lobby.shift();
        const player2 = lobby.shift();
        const gameId = `game-${uuidv4()}`;
        games.set(gameId, [player1, player2]);
        console.log(`Paired ${player1} and ${player2} in ${gameId}`);
          console.log(lobby)

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
      foundArr = data.foundArr;
      let gameId, opponentId;
      for (const [id, players] of games) {
        if (players.includes(data.playerId)) {
          gameId = id;
            console.log("updateFound:", players)
          opponentId = players.find((id) => id !== data.playerId);
          break;
        }
      }
      if (opponentId) {
        const opponentWs = clients.get(opponentId);
        if (opponentId?.readyState === opponentWs.OPEN) {
          opponentWs.send(JSON.stringify({ type: "updateFound", foundArr }));
        }
      }
    }
  });

  ws.on("close", () => {
    const playerId = [...clients].find(([id, client]) => client === ws)?.[0];
    if (playerId) {
      console.log(`${playerId} disconnected`);
      clients.delete(playerId);
      const index = lobby.indexOf(playerId);
      if (index !== -1) lobby.splice(index, 1);
      console.log("Lobby after disconnect", lobby);
    }
  });
});
