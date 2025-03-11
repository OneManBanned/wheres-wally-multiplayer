import { foundArr } from "./game.js";
import {
  findMarkerSize,
  getPhotoRect,
  getPathFromURL,
  positionInPercent,
} from "./utils.js";

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

export function createTargetingBox(position, checkCharacter, rect, img) {
  const box = document.createElement("div");
  box.id = "target-box";
  const { x, y } = position;

  const markerSize = findMarkerSize(rect);

  box.style.left = `${x - markerSize / 2}px`;
  box.style.top = `${y - markerSize / 2}px`;
  box.style.width = `${markerSize}px`;
  box.style.height = `${markerSize}px`;

  document.getElementById("puzzle-container").appendChild(box);

  const { xPercent, yPercent } = positionInPercent(position, rect);
  const pathname = getPathFromURL(img.src);

  const index = puzzles.indexOf(pathname);
  checkCharacter(index, xPercent, yPercent, switchInPlayPhoto);
}

export function setupPhoto(checkCharacter) {

  switchInPlayPhoto();
  const image = document.getElementById("currentPuzzle");
  image.addEventListener("click", (e) => {
    const rect = getPhotoRect(image);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let oldBox = document.querySelector("#target-box");
    if (oldBox) oldBox.remove();

    createTargetingBox({ x, y }, checkCharacter, rect, image);
  });
  // Magnifying glass placeholder
  image.addEventListener("mouseover", (e) => {});
}
