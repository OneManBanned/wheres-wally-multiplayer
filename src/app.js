// ./src/app.js
import express from "express";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
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
const wss = new WebSocketServer({ server, path: "/ws" });

const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

const DEFAULT_FOUND_ARR = () => Array(PUZZLE_COUNT).fill(false);
const DEFAULT_POWERUPS_ARR = () =>
  Array(PUZZLE_COUNT)
    .fill()
    .map(() => ({
      odlaw: false,
      wenda: false,
      whitebeard: false,
    }));

setupWebSocket(wss, stateManager, DEFAULT_FOUND_ARR, DEFAULT_POWERUPS_ARR);

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    tls: true,
    rejectUnauthorized: false,
    reconnectStrategy: (retires) => {
      if (retires > 5)
        return new Error("Redis connection failed after 5 retries");
      return Math.min(retires * 100, 3000);
    },
    connectTimeout: 10000,
  },
});

redisClient.on("error", (err) => console.error("Redis client error:", err));
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("ready", () => console.log("Redis Connection Ready"));
redisClient.on("end", () => console.log("Redis Connection Closed"));
redisClient
  .connect()
  .catch((err) => console.error("Redis connection error:", err));

if (!process.env.SECRET) {
  throw new AppError(
    "Session secret is missing. Please set SECRET environment variable.",
    500,
  );
}

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
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

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
