import { createMarker } from "./ui.js";
import { findMarkerSize } from "./utils.js";

let gameActive, timeLeft;

export function startGame() {
    const timerDisplay = document.querySelector("#timer");
    timeLeft = parseFloat(timerDisplay.dataset.timeLeft);
    gameActive = true;

    setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft -= 1;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60)
                .toString()
                .padStart(2, "0");
            timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
        } else {
            gameActive = false;
            timerDisplay.textContent = "Time's up!";
        }
    }, 1000);
}

export function checkCharacter(index, x, y, rect) {
    fetch("/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, x, y }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            const {success, gameOver, position} = data;
            if (success) {
                const markerSize = findMarkerSize(rect);
                createMarker(position, markerSize)
            }
            if (gameOver) {
                alert("Game over")
            }
        })
        .catch((err) => {
            console.error("Fetch error: ", err);
            alert("Something went wrong");
        });
}
