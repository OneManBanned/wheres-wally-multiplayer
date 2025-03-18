import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { startGame, checkGuess } from "../controllers/game.js";

const router = Router();

router.get("/", (req, res) => {
  if (!req.session.playerId) {
    req.session.playerId = uuidv4();
  }
  startGame(req, res);
});

router.post("/guess", checkGuess);

export default router;
