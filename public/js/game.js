import { allPuzzles, mainPuzzle, timerDisplay, ws } from "./main.js";
import {
    updateTimerDisplay,
    switchToUnsolvedPuzzle,
    updateThumbnails,
} from "./ui.js";

let gameActive, timeLeft;
export let foundArr = [];

export function setFoundArr(newArr) {
    console.log("setFoundArr: ", newArr);
    foundArr = newArr;
}

export function setGameOver() {
    gameActive = false;
    return alert("Game over");
}

export function startGame() {
    timeLeft = parseFloat(timerDisplay.dataset.timeLeft);
    gameActive = true;

    setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft -= 1;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60)
                .toString()
                .padStart(2, "0");
            updateTimerDisplay(`Time left: ${minutes}:${seconds}`, timerDisplay);
        } else {
            gameActive = false;
            updateTimerDisplay("Time's up!", timerDisplay);
        }
    }, 1000);
}

export async function checkCharacter(index, x, y) {
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index, x, y }),
        });

        const data = await res.json();

        const { success, gameOver } = data;

        if (success) {
            foundArr[index] = true;
            updateThumbnails(allPuzzles);
            const unsolvedIdx = foundArr.indexOf(false);
            if (unsolvedIdx !== -1) switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
            ws.send(JSON.stringify({ type: "updateFound", foundArr, playerId }));
        }

        if (gameOver) {
            setGameOver()
        }
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}
