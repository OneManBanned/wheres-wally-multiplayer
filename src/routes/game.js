import { Router } from "express";
import { startGame, checkGuess } from "../controllers/game.js";

const router = Router()

router.get("/", startGame)
router.post("/check", checkGuess)

export default router;
