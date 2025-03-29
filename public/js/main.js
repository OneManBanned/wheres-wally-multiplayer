import { checkCharacter } from "./game.js";
import { showLobby, setupPuzzle, setupThumbnailListeners } from "./ui.js";
import { initWebSocket } from "./websockets.js";

export const lobbyView = document.querySelector("#lobby-view")
export const gameView = document.querySelector("#game-view")
export const allPuzzles = document.querySelectorAll(".puzzle");
export const mainPuzzle = document.querySelector("#currentPuzzle");
export const mainPuzzleContainer = document.getElementById("puzzle-container");
export const timerDisplay = document.querySelector("#timer");
export const headshots = document.querySelectorAll(".headshot");
export const allHeadshotContainers = document.querySelectorAll(".headshot-container")
export const allPuzzleContainers = document.querySelectorAll(".puzzleSelect-container")
export const playerScore = document.querySelector("#playerScore")
export const opponentScore = document.querySelector("#opponentScore")
export const lens = document.querySelector(".lens-content")

initWebSocket({ playerId, mainPuzzle, mainPuzzleContainer, lobbyView, gameView });

setupPuzzle(mainPuzzle, (index, x, y) => checkCharacter(index, x, y, window.playerId),);
setupThumbnailListeners(allPuzzles, mainPuzzle);
showLobby();
