import { stateManager } from "../app.js";
import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";
import { GAME_DURATION, PUZZLE_COUNT } from "../constants.js";
import { WebSocketService } from "../services/webSocketService.js";
import { EffectService } from "../services/effectService.js";
import { GameService } from "../services/gameService.js";
import { AppError } from "../utils/errors.js";

let webSocketService, effectService, gameService;

function initService() {
     webSocketService = new WebSocketService(stateManager);
     effectService = new EffectService(stateManager, webSocketService);
     gameService = new GameService( stateManager, effectService, webSocketService);
}

export const homePage = (req, res) => {
    res.render("home")
}

export const startGame = (req, res) => {
  res.render("index", {
    puzzles: Object.values(puzzles).map((char) => char.img),
    playerId: (req.session.playerId = uuidv4()),
    gameDuration: GAME_DURATION,
  });
};

export const checkGuess = (req, res) => {
  initService();
  const { puzzleIdx, x, y, playerId } = req.body;

  if (!playerId || typeof playerId !== "string") {
    throw new AppError("Invalid or missing playerId", 400);
  }
  if ( !Number.isInteger(puzzleIdx) || puzzleIdx < 0 || puzzleIdx >= PUZZLE_COUNT) {
    throw new AppError("Invalid puzzle index", 400);
  }
  if (typeof x !== "number" || typeof y !== "number") {
    throw new AppError("Invalid coordinates", 400);
  }

  const charFound = gameService.processGuess(puzzleIdx, x, y, playerId);

  res.json({ charFound });
};
