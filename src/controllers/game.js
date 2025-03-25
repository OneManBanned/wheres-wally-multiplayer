import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";
import { games, clients } from "../app.js";
import { checkCharacterInRange, getGameByPlayerId, getGameWsByPlayerId, wsOpenSend } from "../utils/utils.js";

export const startGame = (req, res) => {
    res.render("index", {
        puzzles: Object.values(puzzles).map((char) => char.img),
        playerId: (req.session.playerId = uuidv4()),
    });
};

export const checkGuess = (req, res) => {
    const { puzzleIdx, x, y, playerId } = req.body;
    const characters = puzzles[puzzleIdx].characters;

    if (!characters)
        return res
            .status(400)
            .json({ success: false, error: "Invalid puzzle index" });

    let charFound = undefined;

    for (let character in characters) {
        const inRange = checkCharacterInRange(character, { x, y }, characters);

        if (inRange) {
            const { gameId, gameData } = getGameByPlayerId(playerId, games);
            const { opponentsWs, playersWs } = getGameWsByPlayerId( playerId, gameData, clients,);
            const { foundArr, playerStats } = gameData;

            switch (character) {
                case "waldo":
                    if (gameData && !foundArr[puzzleIdx]) {
                        foundArr[puzzleIdx] = true;
                        playerStats[playerId].wallysFound += 1;
                        wsOpenSend(playersWs, { type: "updateFound", foundArr, playerStats, });
                        wsOpenSend(opponentsWs, { type: "updateFound", foundArr, playerStats, });

                        if (!foundArr.includes(false)) {
                            wsOpenSend(opponentsWs, { type: "gameOver", reason: "allFound" });
                            wsOpenSend(playersWs, { type: "gameOver", reason: "allFound" });
                            games.delete(gameId);
                        }
                    }
                    charFound = "waldo";
                    break;
                case "odlaw":
                    charFound = "odlaw";
                    break;
                case "wenda":
                    charFound = "wenda";
                    break;
                case "whitebeard":
                    charFound = "whitebeard";
                    break;
                default:
                    break;
            }
        }
    }
};
