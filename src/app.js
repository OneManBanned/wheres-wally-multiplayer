import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import gameRoutes from "./routes/game.js";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./websockets.js";
import { puzzles } from "./models/puzzles.js";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    session({
        secret: process.env.SECRET || "wheres-wally-secret",
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
export const clients = new Map();
export const effectTimeouts = new Map();
const lobby = [];
export const games = new Map();
export const GAME_DURATION = 300000; // 5 minutes
const NUMBER_OF_PUZZLES = puzzles.length;
const DEFAULT_FOUND_ARR = () => Array(NUMBER_OF_PUZZLES).fill(false)
const DEFAULT_POWERUPS_ARR = () => Array.from({length: NUMBER_OF_PUZZLES}, () => ({
    odlaw: false,
    wenda: false,
    whitebeard: false
    }
))

wss.on("listening", () => console.log("WS running"))

setupWebSocket(wss, clients, lobby, games, GAME_DURATION, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR, effectTimeouts);
