import { puzzles, gameState, GAME_DURATION } from "../models/puzzles.js";

export const startGame = (req, res) => {
    const sessionId = req.headers["x-session-id"] || "default";
    gameState.set(sessionId, { startTime: Date.now(), found: new Set()});
    res.render("index", {
        puzzles:  Object.values(puzzles).map(char => char.img),
        playerId: req.session.playerId,
        initialTime: GAME_DURATION / 1000,
    });
};

export const checkGuess = (req, res) => {
    const { index, x, y } = req.body;
    const sessionId = req.headers["x-session-id"] || "default";
    const state = gameState.get(sessionId);
    const elapsed = Date.now() - state.startTime;
    const timeLeft = Math.max(0, (GAME_DURATION - elapsed) / 1000);
    const characters = puzzles[index].characters;

    if (timeLeft <= 0) {
        return res.json({
            success: false,
            message: "Times Up!",
            timeLeft: 0,
            timeTaken: null,
        });
    }

    let solved = false;


    for (let character in characters) {
        const inRange =
            x >= characters[character].x &&
            x <= characters[character].x + characters[character].width &&
            y >= characters[character].y &&
            y <= characters[character].y + characters[character].height;

        if (inRange && character === 'waldo') {
            state.found.add(index);
            solved = true;
        }

    }

    const allFound = state.found.size === Object.keys(puzzles).length;
    const timeTaken = allFound ? elapsed / 1000 : null;

    res.json({
        success: solved,
        timeTaken,
        timeLeft,
    });
};
