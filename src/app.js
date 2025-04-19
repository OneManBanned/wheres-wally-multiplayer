import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import gameRoutes from "./routes/game.js";
import { StateManager } from "./state/stateManager.js";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./websockets.js";
import { PUZZLE_COUNT } from "./constants.js";
import { createServer } from "http";
import { AppError } from "./utils/errors.js";

export const stateManager = new StateManager();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

const DEFAULT_FOUND_ARR = () => Array(PUZZLE_COUNT).fill(false)
const DEFAULT_POWERUPS_ARR = () => Array(PUZZLE_COUNT)
    .fill()
    .map(() => ({
    odlaw: false,
    wenda: false,
    whitebeard: false
    }))

setupWebSocket(wss, stateManager, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR);

app.use(
    session({
        secret: process.env.SECRET || "wheres-wally-secret",
        resave: false,
        saveUninitialized: true,
    }),
);

app.use("/", gameRoutes);

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
  } else {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

server.listen(PORT, () => console.log("Server running on port 3000"));
