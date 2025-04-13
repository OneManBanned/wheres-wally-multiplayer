import { GAME_DURATION } from "../constants.js";
import { updateTimerDisplay } from "../ui/ui.js";
import { wsSend } from "../websockets/websockets.js";

export let isGameOver = false;
let startTime;
export const setGameOver = () => (isGameOver = true);
export const setStartTime = (time) => (startTime = time);

export function startGameTimer() {
    const totalTime = GAME_DURATION;

    const timerInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(timerInterval);
            return;
        }

        let timeLeft = totalTime - (Date.now() - startTime);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            setGameOver();
            updateTimerDisplay("Time's Up!");
            wsSend({ type: "gameTimeout", playerId: PLAYER_ID });
            return;
        }

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000)
            .toString()
            .padStart(2, "00");

        updateTimerDisplay(`${minutes}:${seconds}`);
    }, 1000);
}

