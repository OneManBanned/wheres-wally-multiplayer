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

setupPuzzle(mainPuzzle, checkCharacter);
setupThumbnailListeners(allPuzzles, mainPuzzle);
syncThumbnailHeights(allPuzzles, mainPuzzle);

function showLobby() {
    document.querySelector("#lobby-view").style.display = "block"
    document.querySelector("#game-view").style.display = "none"
}

function showGame() {
    document.querySelector("#lobby-view").style.display = "none"
    document.querySelector("#game-view").style.display = "flex"
}

showLobby();

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
        updateThumbnails(allPuzzles);
        showLobby();
    }
    if (data.type === "paired") {
        console.log(data)
        showGame();
        startGame(data.startTime);
        console.log(`Paired in ${data.gameId} vs ${data.opponentId} at ${data.startTime}`);
    }

    if (data.type === "gameOver") {
        setGameOver();
        console.log(`Game over: ${data.reason}`)
        return;
    }

    if (data.type === "updateFound") {
        setFoundArr(data.foundArr);
        updateThumbnails(allPuzzles);
        const unsolvedIdx = data.foundArr.indexOf(false);
        if (unsolvedIdx !== -1) switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
        console.log(`Updated found array ${data.foundArr}`);
    }

    if (data.type === "opponentQuit") {
        console.log(`Opponent quit game ${data.gameId} is over`)
    }
        

};

ws.onclose = () => {
    console.log("Disconnected from WebSocker server");
};

ws.onerror = (e) => {
    console.log("WebSocker error: ", e);
};
