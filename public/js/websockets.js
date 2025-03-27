import { startGame, setFoundArr, setGameOver, setStartTime, setPowerUpsArr, } from "./game.js";
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

export function initWebSocket({ playerId, mainPuzzle, mainPuzzleContainer}) {
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

                /*
                            mainPuzzle.style.transform = "rotateX(180deg)";
                            mainPuzzle.dataset.flipped = "true";
                            setTimeout(() => {
                                mainPuzzle.style.transform = "none";
                                delete mainPuzzle.dataset.flipped;
                            }, 15000);
                
                */
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
