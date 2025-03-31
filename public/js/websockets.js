import { PUZZLES, PLAYER_ID } from "./game.js";
import { startGameTimer, setGameOver, setStartTime } from "./game.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI, } from "./ui/ui.js";
import { setupConfetti } from "./ui/animations.js";
import { DOM } from "./main.js";

export function initWebSocket(playerId) {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    ws.send(JSON.stringify({ type: "join", playerId }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("WebSocket message:", data);
    const handler = handlers[data.type];
    if (handler) handler(data);
    else console.warn(`Unhandled message type: ${data.type}`);
  };

  ws.onclose = () => console.log("Disconnected from WebSocket server");
  ws.onerror = (e) => console.log("WebSocker error: ", e);
}

const handlers = {
    paired: ({ foundArr, startTime, playerStats, puzzleIdx }) => {
      setStartTime(startTime);
      switchPuzzle(PUZZLES, foundArr, puzzleIdx);
      updateScores(playerStats, PLAYER_ID);
      showGame();
      startGameTimer();
    },

    updateFound: ({foundArr, playerStats, playerWhoFoundId, puzzleIdx}) => {
      updateScores(playerStats, PLAYER_ID);
      updateThumbnailUI(playerWhoFoundId, puzzleIdx);
      switchPuzzle(PUZZLES, foundArr, puzzleIdx);
    },

    gameOver: () => {
      setGameOver();
      return alert("Game over");
    },

    opponentQuit: ({gameId}) => {
      console.log(`Opponent quit game ${gameId} is over`);
      showLobby();
    },

    powerUpFound: ({puzzleIdx, character, playerWhoFoundId}) => {
      updateFoundCharacterUI(puzzleIdx, character);

      if (character === "odlaw" && playerWhoFoundId !== PLAYER_ID) {
        const confettiBottomLeft = setupConfetti({ x: 0, y: 1.1 }, 60);
        const confettiBottomRight = setupConfetti({ x: 1, y: 1.1 }, 120);
        const confettiMiddleBottom = setupConfetti({ x: 0.5, y: 1.1 }, 90);

        setTimeout(() => {
          confettiBottomLeft();
          confettiBottomRight();
          confettiMiddleBottom();
        }, 10000);

        DOM.mainPuzzle.classList.remove(
          "spin-to-upside-down",
          "spin-to-normal",
        );
        DOM.mainPuzzleContainer.classList.add("flipped");

        DOM.mainPuzzle.dataset.flipped = "true";
        DOM.mainPuzzle.classList.add("spin-to-upside-down");

        setTimeout(() => {
          DOM.mainPuzzle.classList.remove("spin-to-upside-down");
          DOM.mainPuzzle.classList.add("spin-to-normal");
          DOM.mainPuzzleContainer.classList.remove("flipped");
          DOM.mainPuzzle.dataset.flipped = "false";
        }, 15000); // Matches spin-to-upside-down duration
      }
    },
  };
