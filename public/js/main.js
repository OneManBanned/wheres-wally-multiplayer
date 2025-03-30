import { checkCharacter } from "./game.js";
import { showLobby, setupPuzzle, setupThumbnailListeners } from "./ui/ui.js";
import { initWebSocket } from "./websockets.js";

export const DOM = {
  lobbyView: document.querySelector("#lobby-view"), // lobby
  gameView: document.querySelector("#game-view"), // gameboard
  mainPuzzle: document.querySelector("#currentPuzzle"), // inPlayPuzzle
  mainPuzzleContainer: document.getElementById("puzzle-container"), // inPlayPuzzleContainer
  allPuzzles: document.querySelectorAll(".puzzle"), // puzzleThumbnails
  allPuzzleContainers: document.querySelectorAll(".puzzleSelect-container"), // puzzleThumbnailsContainer
  headshots: document.querySelectorAll(".headshot"), // auxCharHeadshots
  allHeadshotContainers: document.querySelectorAll(".headshot-container"), // auxCharHeadshotContainers
  timerDisplay: document.querySelector("#timer"),
  playerScore: document.querySelector("#playerScore"),
  opponentScore: document.querySelector("#opponentScore"),
};

initWebSocket({ playerId: window.playerId });
setupPuzzle((index, x, y) => checkCharacter(index, x, y, window.playerId));
setupThumbnailListeners();
showLobby();
