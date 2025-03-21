import { allPuzzles, mainPuzzle, timerDisplay } from "./main.js";
import {
  updateTimerDisplay,
  switchToUnsolvedPuzzle,
  updateThumbnails,
} from "./ui.js";

let gameOver, startTime;
export let foundArr = [];
export let powerUpsArr = [];

export function setFoundArr(newArr) {
  foundArr = newArr;
}

export function setPowerUpsArr(newArr) {
  powerUpsArr = newArr;
}

export function setGameOver() {
  gameOver = true;
}

export function setStartTime(time) {
  startTime = time;
}

export function startGame() {
  gameOver = false;
  const totalTime = 300000;

  const timerInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }

    let timeLeft = totalTime - (Date.now() - startTime);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      setGameOver();
      updateTimerDisplay("Time's Up!", timerDisplay);
      return;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000)
      .toString()
      .padStart(2, "00");
    updateTimerDisplay(`Time left: ${minutes}:${seconds}`, timerDisplay);
  }, 1000);
}

export async function checkCharacter(puzzleIdx, x, y, ws, playerId) {
  try {
    const res = await fetch("/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puzzleIdx, x, y }),
    });

    const data = await res.json();

    const { charFound } = data;

    if (charFound === "waldo") {
      foundArr[puzzleIdx] = true;
      updateThumbnails(allPuzzles);
      switchToUnsolvedPuzzle(mainPuzzle, puzzles, foundArr);
      ws.send(JSON.stringify({ type: "updateFound", foundArr, playerId }));
    } else if (charFound) {

        powerUpsArr[puzzleIdx][charFound] = true;

        switch(charFound) {
            case "odlaw":
                console.log(`${charFound} has been found in puzzle ${puzzleIdx}`);
                ws.send(JSON.stringify({type: "powerUpFound", powerUpsArr, playerId, character: charFound}))
                break;
            case "wenda":
                console.log(`${charFound} has been found in puzzle ${puzzleIdx}`);
                ws.send(JSON.stringify({type: "powerUpFound", powerUpsArr, playerId, character: charFound}))
                break;
            case "whitebeard":
                console.log(`${charFound} has been found in puzzle ${puzzleIdx}`);
                ws.send(JSON.stringify({type: "powerUpFound", powerUpsArr, playerId, character: charFound}))
                break;
            default:
                console.log(`Unknown character ${charFound}`);
        }
    }
  } catch (err) {
    console.error("Fetch error: ", err);
    alert("Something went wrong");
  }
}
