import { allPuzzles, mainPuzzle, timerDisplay } from "./main.js";
import { updateTimerDisplay, switchToUnsolvedPuzzle, updateThumbnails, } from "./ui.js";

let gameOver, startTime;
export let foundArr = [];

export function setFoundArr(newArr) {
    foundArr = newArr;
}

export function setGameOver() {
    gameOver = true;
}

export function setStartTime(time) {
    startTime = time
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

export async function checkCharacter(index, x, y, ws, playerId) {
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index, x, y }),
        });

        console.log(res.headers, playerId)
        const data = await res.json();

        const { success } = data;

        if (success) {
            foundArr[index] = true;
            updateThumbnails(allPuzzles);
            const unsolvedIdx = foundArr.indexOf(false);
            if (unsolvedIdx !== -1)
                switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
            console.log("Data: ", data)
            ws.send(JSON.stringify({ type: "updateFound", foundArr, playerId }));
        }
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}
