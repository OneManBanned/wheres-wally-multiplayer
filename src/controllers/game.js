import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";

export const startGame = (req, res) => {
  res.render("index", {
    puzzles: Object.values(puzzles).map((char) => char.img),
    playerId: req.session.playerId = uuidv4(),
  });
};

export const checkGuess = (req, res) => {
  const { index, x, y } = req.body;
  const characters = puzzles[index].characters;

  let solved = false;

  for (let character in characters) {
    const inRange =
      x >= characters[character].x &&
      x <= characters[character].x + characters[character].width &&
      y >= characters[character].y &&
      y <= characters[character].y + characters[character].height;

    if (inRange && character === "waldo") {
      solved = true;
      break;
    }
  }

  res.json({
    success: solved,
  });
};
