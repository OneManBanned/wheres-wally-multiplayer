import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import gameRoutes from "./routes/game.js";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./websockets.js";

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

setupWebSocket(wss, clients, lobby, games);
