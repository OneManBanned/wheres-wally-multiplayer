import { findMarkerSize, getPhotoRect, getPathFromURL, positionInPercent } from "./utils.js";

export function switchInPlayPhoto() {
  const puzzles = document.querySelectorAll("#puzzle");
  puzzles.forEach((puzzle) => {
    puzzle.addEventListener("click", (e) => {
      document.querySelector("#currentPuzzle").src = puzzle.src;
    });
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

  for (let index = 0; index < puzzles.length; ++index) {
    if (pathname === puzzles[index]) {
      checkCharacter(index, xPercent, yPercent);
    }
  }
}

export function setupPhoto(checkCharacter) {

  const image = document.getElementById("currentPuzzle");
  image.addEventListener("click", (e) => {
    const rect = getPhotoRect(image);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const oldBox = document.querySelector("#target-box");
    if (oldBox) oldBox.remove();

    createTargetingBox({ x, y }, checkCharacter, rect, image);
  });
  // Magnifying glass placeholder
  image.addEventListener("mouseOver", (e) => {});
}

