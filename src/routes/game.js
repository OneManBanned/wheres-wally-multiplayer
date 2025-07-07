import { Router } from "express";
import { startGame, checkGuess, homePage } from "../controllers/game.js";

const router = Router();

router.get("/", homePage)
router.get("/game", startGame);

router.post("/guess", checkGuess);

export default router;
