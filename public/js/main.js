import { checkCharacter } from "./game.js";
import { showLobby, setupPuzzle, setupThumbnailListeners } from "./ui.js";
import { initWebSocket } from "./websockets.js";


export const allPuzzles = document.querySelectorAll(".puzzle");
export const mainPuzzle = document.querySelector("#currentPuzzle");
export const timerDisplay = document.querySelector("#timer");
export const headshots = document.querySelectorAll(".headshot");
export const allHeadshotContainers = document.querySelectorAll(".headshot-container")
export const allPuzzleContainers = document.querySelectorAll(".puzzleSelect-container")
export const playerScore = document.querySelector("#playerScore")
export const opponentScore = document.querySelector("#opponentScore")

initWebSocket({ playerId, mainPuzzle, allPuzzleContainers });

setupPuzzle(mainPuzzle, (index, x, y) => checkCharacter(index, x, y, window.playerId),);
setupThumbnailListeners(allPuzzles, mainPuzzle);
showLobby();
