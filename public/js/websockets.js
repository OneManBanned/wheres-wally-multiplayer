import { startGame, setFoundArr, setGameOver, setStartTime, setPowerUpsArr, } from "./game.js";
import { showLobby, showGame, updateSolvedThumbnails, updateScores, updateFoundCharacters, switchToUnsolvedPuzzle, syncFoundCharacters, } from "./ui.js";


document.addEventListener("DOMContentLoaded", () => {
  const puzzleContainer = document.getElementById("puzzle-container");
  if (!puzzleContainer) {
    console.error("puzzleContainer is null or undefined!");
    return;
  }

  // Create a canvas element and append it to puzzleContainer
  const canvas = document.createElement("canvas");
  canvas.width = puzzleContainer.offsetWidth;
  canvas.height = puzzleContainer.offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "1";
  puzzleContainer.appendChild(canvas);

  // Store the confetti instance
  window.confettiInstance = confetti.create(canvas, { resize: true });
});

export function initWebSocket({ playerId, mainPuzzle }) {
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

          const confettiBomb = setInterval(() => {
  window.confettiInstance({
            particleCount: 1500,
            spread: 100,
            origin: { y: 1 },
            colors: ['#000000', '#FFC107', '#FFFFFF'],
          });
}, 1000)

          setTimeout(() => {
              clearInterval(confettiBomb)
          }, 10000)

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
