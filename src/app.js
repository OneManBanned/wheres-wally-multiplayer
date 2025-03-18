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
    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.type === "join") {
            const playerId = data.playerId;
            clients.set(playerId, ws);
            lobby.push(playerId);
            ws.send(
                JSON.stringify({
                    type: "init",
                    status: "waiting",
                    foundArr: Array(5).fill(false),
                }),
            );

            if (lobby.length > 1) {
                const player1 = lobby.shift();
                const player2 = lobby.shift();
                const gameId = `game-${uuidv4()}`;
                const startTime = Date.now();
                games.set(gameId, {
                    players: [player1, player2],
                    foundArr: Array(5).fill(false),
                    startTime,
                });
                console.log(
                    `Paired ${player1} and ${player2} in ${gameId} at ${startTime}`,
                );

                const ws1 = clients.get(player1);
                const ws2 = clients.get(player2);
                ws1.send(
                    JSON.stringify({
                        type: "paired",
                        gameId,
                        opponentId: player2,
                        foundArr: games.get(gameId).foundArr,
                        startTime
                    }),
                );
                ws2.send(
                    JSON.stringify({
                        type: "paired",
                        gameId,
                        opponentId: player1,
                        foundArr: games.get(gameId).foundArr,
                        startTime
                    }),
                );

                setTimeout(() => {
                    console.log("SERVER: TIMESUP")
                    const game = games.get(gameId);
                    if (game && Date.now() - game.startTime >= 300000) {
                        let ws1 = clients.get(player1);
                        let ws2 = clients.get(player2);

                        if (ws1?.readyState === ws1.OPEN) {
                            ws1.send(JSON.stringify({ type: "gameOver", reason: "timeUp" }));
                        }
                        if (ws2?.readyState === ws2.OPEN) {
                            ws2.send(JSON.stringify({ type: "gameOver", reason: "timeUp" }));
                        }
                        games.delete(gameId);
                    }
                }, 300000); // 5 minutes
            }
        }

        if (data.type === "updateFound") {
            let game = null;
            for (const [id, gameData] of games) {
                if (gameData.players.includes(data.playerId)) {
                    game = gameData;
                    game.foundArr = data.foundArr;
                    console.log("Update:", id);
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
                console.log("Close:", gameId);
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
