import { checkCharacter } from "./game.js";
import { showLobby, setupPuzzle, setupThumbnailListeners, syncThumbnailHeights, syncHeadshotHeights, } from "./ui.js";
import { initWebSocket } from "./websockets.js";

export const allPuzzles = document.querySelectorAll(".puzzle");
export const mainPuzzle = document.querySelector("#currentPuzzle");
export const timerDisplay = document.querySelector("#timer");
export const headshots = document.querySelectorAll(".headshot");

const ws = initWebSocket({ playerId, allPuzzles, mainPuzzle, timerDisplay });

setupPuzzle(mainPuzzle, (index, x, y) => checkCharacter(index, x, y, ws, window.playerId),);
setupThumbnailListeners(allPuzzles, mainPuzzle);
syncThumbnailHeights(allPuzzles, mainPuzzle);
syncHeadshotHeights(headshots, allPuzzles[0]);
showLobby();
