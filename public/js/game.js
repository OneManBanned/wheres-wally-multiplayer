import {  allPuzzleContainers, gameView, mainPuzzleContainer, timerDisplay } from "./main.js";
import { showWallyFoundFeedback, updateTimerDisplay, } from "./ui.js";

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
         const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puzzleIdx, x, y, playerId }),
        });

        const { charFound } = await res.json()

        if (!charFound) {
            showMissFeedback(mainPuzzleContainer)
        } else {
            if (charFound === "waldo") {
                const thumbnail = allPuzzleContainers[puzzleIdx]
                console.log(thumbnail)
                showWallyFoundFeedback(mainPuzzleContainer.querySelector("#magnifier .lens-content"), thumbnail, gameView)
            }
        }

    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}

export function showMissFeedback(puzzleContainer) {

    const buzzSound = document.querySelector("#miss-buzz")

    buzzSound.volume = 0.2;
    buzzSound.play()

  puzzleContainer.classList.add("shake");
  setTimeout(() => {
    puzzleContainer.classList.remove("shake");
  }, 500); // Matches animation duration
}
