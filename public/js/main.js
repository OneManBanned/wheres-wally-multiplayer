import { startGame, checkCharacter, setFoundArr, setGameOver } from "./game.js";
import {
    setupPuzzle,
    setupThumbnailListeners,
    updateThumbnails,
    syncThumbnailHeights,
    switchToUnsolvedPuzzle,
} from "./ui.js";

export const allPuzzles = document.querySelectorAll(".puzzle");
export const mainPuzzle = document.querySelector("#currentPuzzle");
export const timerDisplay = document.querySelector("#timer");

startGame();
setupPuzzle(mainPuzzle, checkCharacter);
setupThumbnailListeners(allPuzzles, mainPuzzle);

mainPuzzle.addEventListener("load", () => {
    syncThumbnailHeights(allPuzzles, mainPuzzle);
});

export const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    ws.send(JSON.stringify({ type: "join", playerId }));
};

ws.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "init") {
        console.log(`Status: ${data.status}`);
        setFoundArr(data.foundArr);
    }
    if (data.type === "paired") {
        console.log(`Paired in ${data.gameId} vs ${data.opponentId}`);
    }

    if (data.type === "updateFound") {
        setFoundArr(data.foundArr);
        updateThumbnails(allPuzzles);
        const unsolvedIdx = data.foundArr.indexOf(false);
        if (unsolvedIdx !== -1) switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
        else setGameOver()
        console.log(`Updated found array ${data.foundArr}`);
    }
};

ws.onclose = () => {
    console.log("Disconnected from WebSocker server");
};

ws.onerror = (e) => {
    console.log("WebSocker error: ", e);
};
