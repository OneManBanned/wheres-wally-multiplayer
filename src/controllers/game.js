import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";
import { games, clients, GAME_DURATION } from "../app.js";
import { checkCharacterInRange, getGameByPlayerId, getGameWsByPlayerId, wsOpenSend, } from "../utils/utils.js";


export const startGame = (req, res) => {
  res.render("index", {
    puzzles: Object.values(puzzles).map((char) => char.img),
    playerId: (req.session.playerId = uuidv4()),
    gameDuration: GAME_DURATION,
  });
};

export const checkGuess = (req, res) => {

  const { puzzleIdx, x, y, playerId } = req.body;
  const characters = puzzles[puzzleIdx].characters;

  if (!characters)
    return res
      .status(400)
      .json({ success: false, error: "Invalid puzzle index" });

let charFound = false;

  for (let character in characters) {
    const inRange = checkCharacterInRange(character, { x, y }, characters);

    if (inRange) {
        charFound = character;
        const result = getGameByPlayerId(playerId, games);

      if (!result || !result.gameData) {
          console.warn(`No game found for playerId ${playerId} in checkGuess`)
        return;
      };

      const { gameId, gameData } = result
      const { opponentsWs, playersWs } = getGameWsByPlayerId( playerId, gameData, clients,);
      const { foundArr, powerUpsArr, playerStats } = gameData;

      if (character === "waldo") {
          foundArr[puzzleIdx] = true;
          playerStats[playerId].wallysFound += 1;

          if (!foundArr.includes(false)) {
            wsOpenSend([playersWs, opponentsWs], { type: "gameOver", reason: "allFound" });
              wsOpenSend([playersWs, opponentsWs], { type: "updateFound", foundArr, playerStats, puzzleIdx, playerWhoFoundId: playerId});
            games.delete(gameId);
          } else {
            wsOpenSend([playersWs, opponentsWs], { type: "updateFound", foundArr, playerStats, puzzleIdx, playerWhoFoundId: playerId});
          }

      } else if (!powerUpsArr[puzzleIdx][character]) {
        powerUpsArr[puzzleIdx][character] = true;
        wsOpenSend([playersWs, opponentsWs], { type: "powerUpFound", powerUpsArr, character, playerStats, puzzleIdx, playerWhoFoundId: playerId });
      }
    }
  }
    res.json({charFound})
};
