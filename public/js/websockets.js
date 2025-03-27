import {
    startGame,
    setFoundArr,
    setGameOver,
    setStartTime,
    setPowerUpsArr,
} from "./game.js";
import {
    showLobby,
    showGame,
    updateSolvedThumbnails,
    updateScores,
    updateFoundCharacters,
    switchToUnsolvedPuzzle,
    syncFoundCharacters,
    setupConfetti,
} from "./ui.js";

export function initWebSocket({ playerId, mainPuzzle, mainPuzzleContainer }) {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        console.log("Connected to WebSocket Server");
        ws.send(JSON.stringify({ type: "join", playerId }));
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const {
            type,
            startTime,
            foundArr,
            gameId,
            powerUpsArr,
            playerStats,
            puzzleIdx,
            character,
        } = data;

        if (type === "paired") {
            setFoundArr(foundArr);
            setPowerUpsArr(powerUpsArr);
            setStartTime(startTime);
            updateSolvedThumbnails();
            syncFoundCharacters();
            switchToUnsolvedPuzzle(mainPuzzle, puzzles, foundArr, puzzleIdx);
            showGame();
            startGame();
        }

        if (type === "gameOver") {
            setGameOver();
            return alert("Game over");
        }

        if (type === "updateFound") {
            setFoundArr(foundArr);
            updateScores(playerStats, playerId);
            updateSolvedThumbnails();
            switchToUnsolvedPuzzle(mainPuzzle, puzzles, foundArr, puzzleIdx);
        }

        if (type === "powerUpFound") {
            setPowerUpsArr(powerUpsArr);
            updateFoundCharacters(puzzleIdx, character);

            if (character === "odlaw") {
                
                                const confettiBottomLeft = setupConfetti(
                                    mainPuzzleContainer,
                                    { x: 0, y: 1.1 },
                                    60,
                                );
                                const confettiBottomRight = setupConfetti(
                                    mainPuzzleContainer,
                                    { x: 1, y: 1.1 },
                                    120,
                                );
                                
                                const confettiMiddleBottom = setupConfetti(
                                    mainPuzzleContainer,
                                    { x: 0.5, y: 1.1 },
                                    90,
                                );
                
                                setTimeout(() => {
                                    confettiBottomLeft();
                                    confettiBottomRight();
                                    confettiMiddleBottom();
                                }, 10000);
                
                mainPuzzle.classList.remove("spin-to-upside-down", "spin-to-normal");

                console.log("Odlaw found, adding spin-to-upside-down");
                mainPuzzle.dataset.flipped = "true";
                mainPuzzle.classList.add("spin-to-upside-down");

                setTimeout(() => {
                    console.log("Upside-down complete, flipping back");
                    mainPuzzle.classList.remove("spin-to-upside-down");
                    mainPuzzle.classList.add("spin-to-normal");
                    mainPuzzle.dataset.flipped = "false";
                }, 10000); // Matches spin-to-upside-down duration
            }
        }

        if (type === "opponentQuit") {
            console.log(`Opponent quit game ${gameId} is over`);
            showLobby();
        }
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server");
    ws.onerror = (e) => console.log("WebSocker error: ", e);
}
