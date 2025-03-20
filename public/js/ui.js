import { foundArr } from "./game.js";
import { allPuzzles } from "./main.js";
import { getPhotoRect, getPathFromURL, positionInPercent } from "./utils.js";

export function showLobby() {
  document.querySelector("#lobby-view").style.display = "block";
  document.querySelector("#game-view").style.display = "none";
}

export function showGame() {
  document.querySelector("#lobby-view").style.display = "none";
  document.querySelector("#game-view").style.display = "flex";
}

export const updateTimerDisplay = (str, timer) => timer.textContent = str;

export function syncThumbnailHeights(thumbnails, mainPuzzle) {
    console.log(mainPuzzle)
    const currentHeight = mainPuzzle.offsetHeight;
    const thumbnailHeight = currentHeight / thumbnails.length;

    thumbnails.forEach((thumb) => (thumb.style.height = `${thumbnailHeight}px`));
}

export function setupThumbnailListeners(thumbnails, mainPuzzle) {
    thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            mainPuzzle.src = thumb.src;
        });
    });
}

export function updateThumbnails() {
    allPuzzles.forEach((puzzle, i) => {
        if (foundArr[i]) {
            puzzle.style.opacity = 0.5;
            puzzle.style.pointerEvents = "none";
        } else {
            puzzle.style.opacity = 1;
            puzzle.style.pointerEvents = "auto"
        }
    });
}

export function switchToUnsolvedPuzzle(mainPuzzle, puzzles, idx) {
    mainPuzzle.src = puzzles[idx];
}

export function targetingCoordinates(position, checkCharacter, rect, img) {
    const { xPercent, yPercent } = positionInPercent(position, rect);
    const pathname = getPathFromURL(img.src);

    const index = puzzles.indexOf(pathname);
    checkCharacter(index, xPercent, yPercent);
}

export function setupPuzzle(mainPuzzle, checkCharacter) {

    mainPuzzle.addEventListener("click", (e) => {
        const rect = getPhotoRect(mainPuzzle);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetingCoordinates({ x, y }, checkCharacter, rect, mainPuzzle);
    });

    setupMagnifier(mainPuzzle);
}

export function setupMagnifier(image) {
    const magnifier = document.createElement("div");
    magnifier.id = "magnifier";
    document.querySelector("#puzzle-container").appendChild(magnifier);

    const zoomLevel = 2;
    let lensSize = 140;

    magnifier.style.height = `${lensSize}px`;
    magnifier.style.width = `${lensSize}px`;

    image.addEventListener("mouseover", () => {
        magnifier.style.display = "flex";
    });

    image.addEventListener("mousemove", (e) => {
        const rect = getPhotoRect(image);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Position lens over mouse
        magnifier.style.left = `${x - lensSize / 2}px`;
        magnifier.style.top = `${y - lensSize / 2}px`;

        // Zoomed background: offset and scale
        const bgX = -(x * zoomLevel - lensSize / 2);
        const bgY = -(y * zoomLevel - lensSize / 2);

        magnifier.style.backgroundImage = `url(${image.src})`;
        magnifier.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
        magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });

    image.addEventListener("mousedown", () => {
        magnifier.classList.add("targeting"); // Switch to reticle
    });

    image.addEventListener("mouseup", () => {
        magnifier.classList.remove("targeting"); // Back to dot
    });

    image.addEventListener("mouseout", () => {
        magnifier.style.display = "none";
        magnifier.classList.remove("targeting"); // Reset on exit
    });
}
