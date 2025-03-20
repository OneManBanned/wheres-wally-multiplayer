import { checkCharacter } from "./game.js";
import { showLobby,  setupPuzzle, setupThumbnailListeners, syncThumbnailHeights  } from "./ui.js";
import { initWebSocket } from "./websockets.js";

export const allPuzzles = document.querySelectorAll(".puzzle");
export const mainPuzzle = document.querySelector("#currentPuzzle");
export const timerDisplay = document.querySelector("#timer");

const ws = initWebSocket({playerId, allPuzzles, mainPuzzle, timerDisplay})

setupPuzzle(mainPuzzle, (index, x, y) => checkCharacter(index, x, y, ws, window.playerId));
setupThumbnailListeners(allPuzzles, mainPuzzle);
syncThumbnailHeights(allPuzzles, mainPuzzle);
console.log("HIT")
showLobby();

