import { foundArr } from "./game.js";
import { getPhotoRect, getPathFromURL, positionInPercent, } from "./utils.js";

export function switchInPlayPhoto() {
    const puzzlesAll = document.querySelectorAll(".puzzle");
    puzzlesAll.forEach((puzzle, index) => {
        if (!foundArr[index]) {
            puzzle.addEventListener("click", () => {
                document.querySelector("#currentPuzzle").src = puzzle.src;
            });
        } else {
            puzzle.style.opacity = 0.5;
            puzzle.style.pointerEvents = "none";
        }
    });
}

export function targetingCoordinates(position, checkCharacter, rect, img) {

    const { xPercent, yPercent } = positionInPercent(position, rect);
    const pathname = getPathFromURL(img.src);

    const index = puzzles.indexOf(pathname);
    checkCharacter(index, xPercent, yPercent, switchInPlayPhoto);
}

export function setupPhoto(checkCharacter) {

    switchInPlayPhoto();
    const image = document.getElementById("currentPuzzle");
    setupMagnifier(image);
    image.addEventListener("click", (e) => {
        const rect = getPhotoRect(image);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        targetingCoordinates({ x, y }, checkCharacter, rect, image);
    });
}

export function setupMagnifier(image) {
    const magnifier = document.createElement("div");
    magnifier.id = "magnifier";
    document.querySelector("#puzzle-container").appendChild(magnifier);

    const zoomLevel = 2;
    let lensSize = 125;

    magnifier.style.height = `${lensSize}px`
    magnifier.style.width = `${lensSize}px`

    image.addEventListener("mouseover", () => {
        magnifier.style.display = "flex";
    })

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
