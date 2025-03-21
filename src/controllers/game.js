import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";

export const startGame = (req, res) => {
    res.render("index", {
        puzzles: Object.values(puzzles).map((char) => char.img),
        playerId: (req.session.playerId = uuidv4()),
    });
};

export const checkGuess = (req, res) => {
    const { puzzleIdx, x, y } = req.body;
    const characters = puzzles[puzzleIdx].characters;

    if (!characters)
        return res
            .status(400)
            .json({ success: false, error: "Invalid puzzle index" });

    let charFound = undefined

    for (let character in characters) {
        const inRange =
            x >= characters[character].x &&
            x <= characters[character].x + characters[character].width &&
            y >= characters[character].y &&
            y <= characters[character].y + characters[character].height;

        if (inRange) {
            switch(character) {
                case "waldo": 
                    charFound = "waldo";
                    break;
                case "odlaw":
                    charFound = "odlaw"
                    break;
                case "wenda":
                    charFound = "wenda"
                    break;
                case "whitebeard":
                    charFound = "whitebeard"
                    break;
                default: 
                    break;
            }
        }
    }

    res.json({
        charFound
    });
};
