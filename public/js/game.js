import { allPuzzles, mainPuzzle, timerDisplay, ws } from "./main.js";
import {
    updateTimerDisplay,
    switchToUnsolvedPuzzle,
    updateThumbnails,
} from "./ui.js";

let gameOver, timeLeft;
export let foundArr = [];

export function setFoundArr(newArr) {
    console.log("setFoundArr: ", newArr);
    foundArr = newArr;
}

export function setGameOver() {
    gameOver = true;
    return alert("Game over");
}

export function startGame(startTime) {
    console.log("INSIDE TIMER: ", gameOver)
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
    /*
      timeLeft = parseFloat(timerDisplay.dataset.timeLeft);
  
      setInterval(() => {
          if (!gameOver && timeLeft > 0) {
              timeLeft -= 1;
              const minutes = Math.floor(timeLeft / 60);
              const seconds = Math.floor(timeLeft % 60)
                  .toString()
                  .padStart(2, "0");
              updateTimerDisplay(`Time left: ${minutes}:${seconds}`, timerDisplay);
          } else {
              updateTimerDisplay("Time's up!", timerDisplay);
          }
      }, 1000);
      */
}

export async function checkCharacter(index, x, y) {
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index, x, y }),
        });

        const data = await res.json();

        const { success } = data;

        if (success) {
            foundArr[index] = true;
            updateThumbnails(allPuzzles);
            const unsolvedIdx = foundArr.indexOf(false);
            console.log(unsolvedIdx);
            if (unsolvedIdx !== -1)
                switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
            ws.send(JSON.stringify({ type: "updateFound", foundArr, playerId }));
        }
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}
