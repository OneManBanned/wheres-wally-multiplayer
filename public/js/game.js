import {  timerDisplay } from "./main.js";
import { updateTimerDisplay, } from "./ui.js";

let gameOver, startTime;
export let foundArr = [];
export let powerUpsArr = [];

export const setFoundArr = (newArr) => foundArr = newArr;
export const setPowerUpsArr = (newArr) => powerUpsArr = newArr;
export const setGameOver = () => gameOver = true;
export const setStartTime = (time) => startTime = time;

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

        updateTimerDisplay(`${minutes}:${seconds}`, timerDisplay);
    }, 1000);
}

export async function checkCharacter(puzzleIdx, x, y, playerId) {
    try {
        console.log("checking guess on client")
         await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puzzleIdx, x, y, playerId }),
        });
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}
