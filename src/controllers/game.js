import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";
import { games, clients } from "../app.js";
import { checkCharacterInRange, getGameByPlayerId, getGameWsByPlayerId, wsOpenSend, } from "../utils/utils.js";

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

let charFound;

  for (let character in characters) {
    const inRange = checkCharacterInRange(character, { x, y }, characters);

    if (inRange) {
        charFound = character;
      const { gameId, gameData } = getGameByPlayerId(playerId, games);
      const { opponentsWs, playersWs } = getGameWsByPlayerId( playerId, gameData, clients,);
      const { foundArr, powerUpsArr, playerStats } = gameData;

      if (character === "waldo") {
          foundArr[puzzleIdx] = true;
          playerStats[playerId].wallysFound += 1;
          wsOpenSend(playersWs, { type: "updateFound", foundArr, playerStats, puzzleIdx});
          wsOpenSend(opponentsWs, { type: "updateFound", foundArr, playerStats, puzzleIdx});

          if (!foundArr.includes(false)) {
            wsOpenSend(opponentsWs, { type: "gameOver", reason: "allFound" });
            wsOpenSend(playersWs, { type: "gameOver", reason: "allFound" });
            games.delete(gameId);
          }

      } else if (!powerUpsArr[puzzleIdx][character]) {
        powerUpsArr[puzzleIdx][character] = true;
        wsOpenSend(opponentsWs, { type: "powerUpFound", powerUpsArr, character, puzzleIdx });
        wsOpenSend(playersWs, { type: "powerUpFound", powerUpsArr, character, puzzleIdx });
      }
    }
  }
    res.json({charFound})
};
