import { puzzles, gameState, GAME_DURATION } from "../models/puzzles.js";

export const startGame = (req, res) => {
    const sessionId = req.headers["x-session-id"] || "default";
    gameState.set(sessionId, { startTime: Date.now(), found: new Set()});
    res.render("index", {
        photos:  Object.values(puzzles).map(char => char.img),
        initialTime: GAME_DURATION / 1000,
    });
};

export const checkGuess = (req, res) => {
    const { index, x, y } = req.body;
    const sessionId = req.headers["x-session-id"] || "default";
    const state = gameState.get(sessionId);
    const elapsed = Date.now() - state.startTime;
    const timeLeft = Math.max(0, (GAME_DURATION - elapsed) / 1000);
    const charData = puzzles[index];

    if (timeLeft <= 0) {
        return res.json({
            success: false,
            message: "Times Up!",
            timeLeft: 0,
            gameOver: true,
            timeTaken: null,
        });
    }

    const inRange =
        x >= charData.x &&
        x <= charData.x + charData.width &&
        y >= charData.y &&
        y <= charData.y + charData.height;

    if (inRange) state.found.add(index);

    const allFound = state.found.size === Object.keys(puzzles).length;
    const gameOver = allFound || timeLeft <= 0;
    const timeTaken = allFound ? elapsed / 1000 : null;

    res.json({
        success: inRange,
        message: inRange ? "found" : null,
        position: inRange ? { x: charData.x, y: charData.y } : null,
        gameOver,
        timeTaken,
        timeLeft,
    });
};
