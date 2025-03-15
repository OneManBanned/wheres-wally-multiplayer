import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { startGame, checkGuess } from "../controllers/game.js";

const router = Router();

router.get("/", (req, res) => {
  if (!req.session.playerId) {
    req.session.playerId = uuidv4();
      console.log("Server: ", req.session.playerId)
  }
  startGame(req, res);
});

router.post("/check", checkGuess);

export default router;
