import { Router } from "express";
import { startGame, checkGuess } from "../controllers/game.js";

const router = Router();

router.get("/", startGame);

router.post("/guess", checkGuess);

export default router;
