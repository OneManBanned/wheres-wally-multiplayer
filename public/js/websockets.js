import { startGame, setFoundArr, setGameOver, setStartTime, setPowerUpsArr, } from "./game.js";
import { showLobby, showGame, updateThumbnails, switchToUnsolvedPuzzle, setupMagnifier, } from "./ui.js";

export function initWebSocket({ playerId, allPuzzles, mainPuzzle }) {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        console.log("Connected to WebSocket Server");
        ws.send(JSON.stringify({ type: "join", playerId }));
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const { type, startTime, foundArr, gameId, powerUpsArr, character } = data;

        if (type === "init") {
            setFoundArr(foundArr);
            updateThumbnails(allPuzzles);
            showLobby();
        }
        if (type === "paired") {
            showGame();
            setPowerUpsArr(powerUpsArr);
            setStartTime(startTime);
            startGame();
        }

        if (type === "gameOver") {
            setGameOver();
            return alert("Game over");
        }

        if (type === "updateFound") {
            setFoundArr(foundArr);
            updateThumbnails(allPuzzles);
            switchToUnsolvedPuzzle(mainPuzzle, puzzles, foundArr);
        }

        if (type === "powerUpFound") {
            console.log("Character power up: ", character);
            mainPuzzle.style.transform = "rotateX(180deg)";
            mainPuzzle.dataset.flipped = "true";
            setTimeout(() => {
            mainPuzzle.style.transform = "none";
                delete mainPuzzle.dataset.flipped;
            }, 15000)

        }

        if (type === "opponentQuit") {
            console.log(`Opponent quit game ${gameId} is over`);
        }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server");
    ws.onerror = (e) => console.log("WebSocker error: ", e);

    return ws;
}
