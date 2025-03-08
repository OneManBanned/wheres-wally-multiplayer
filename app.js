import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

const characters = {
    waldo1: {
        x: 48.31,
        y: 45.18,
        width: 1.25,
        height: 6.38,
    },
};

const GAME_DURATION = 300000;
const gameState = new Map();

app.get("/", (req, res) => {
    const sessionId = req.headers["x-session-id"] || "default";
    gameState.set(sessionId, { startTime: Date.now(), found: new Set() });
    res.render("index", {
        photo: "/images/waldo.jpg",
        initialTime: GAME_DURATION / 1000,
        characters: characters
    });
});

app.post("/check", (req, res) => {
    const { char, x, y } = req.body;
    const sessionId = req.headers["x-session-id"] || "default";
    const state = gameState.get(sessionId);
    const elapsed = Date.now() - state.startTime;
    const timeLeft = Math.max(0, (GAME_DURATION - elapsed) / 1000);
    const charData = characters[char];

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

    if (inRange) state.found.add(char);

    const allFound = state.found.size === Object.keys(characters).length;
    const gameOver = allFound || timeLeft <= 0;
    const timeTaken = allFound ? elapsed / 1000 : null;

    res.json({
        success: inRange,
        message: inRange ? "You found Waldo" : "Try again!",
        position: inRange ? { x: charData.x, y: charData.y } : null,
        gameOver,
        timeTaken,
        timeLeft
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
