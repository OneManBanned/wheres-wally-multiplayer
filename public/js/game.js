import { updateTimerDisplay } from "./ui/ui.js";
import { showMissFeedback } from "./ui/animations.js";

export const PUZZLES = window.puzzles || [
    "/images/wallyspace.jpg",
    "/images/wallysnow.jpg",
    "/images/wallyrace.jpg",
    "/images/wallybeach.jpg",
    "/images/wallyblue.jpg",
];
export const PLAYER_ID = window.playerId || "default-player-id";

let gameOver, startTime;
export const setGameOver = () => (gameOver = true);
export const setStartTime = (time) => (startTime = time);

export function startGameTimer() {
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
            updateTimerDisplay("Time's Up!");
            return;
        }

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000)
            .toString()
            .padStart(2, "00");

        updateTimerDisplay(`${minutes}:${seconds}`);
    }, 1000);
}

export async function checkCharacter(puzzleIdx, x, y, playerId) {
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puzzleIdx, x, y, playerId }),
        });

        const { charFound } = await res.json();

        if (!charFound) showMissFeedback();
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Something went wrong");
    }
}
