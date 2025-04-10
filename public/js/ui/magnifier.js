import { DOM } from "../main.js";
import { magnifierConfig } from "../constants.js";
import { animationState } from "./animations.js";
import { getPlayerStats } from "../game/state.js";

function createMagnifier() {
  const magnifier = document.createElement("div");
  magnifier.id = "magnifier";
  magnifier.style.height = `${magnifierConfig.lensSize} px`;
  magnifier.style.width = `${magnifierConfig.lensSize} px`;

  const lens = document.createElement("div");
  lens.className = "lens-content";
  magnifier.appendChild(lens);

  const glassEffect = document.createElement("div");
  glassEffect.className = "glass-effect";
  magnifier.appendChild(glassEffect);

  DOM.mainPuzzleContainer.appendChild(magnifier);

  return magnifier;
}

export function moveMagnifierWithMouse(magnifier, image, e) {
  if (animationState.get()) return;

  const rect = image.getBoundingClientRect();
  const { zoomLevel, lensSize } = magnifierConfig;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const isFlipped = image.dataset.flipped === "true"; 

  magnifier.style.left = `${x - lensSize / 2}px`;
  magnifier.style.top = `${y - lensSize / 2}px`; 

  const { bgX, bgY } = getLensCoordinates( isFlipped, rect, zoomLevel, lensSize, x, y)
  setLensBgImage(rect, zoomLevel, image, { bgX, bgY });
}

export function syncMagnifierBackground(magnifier, image = DOM.mainPuzzle) {
  if (!magnifier || !image) return;

  const { left, top } = magnifier.style;
  const rect = image.getBoundingClientRect();
  const { zoomLevel, lensSize } = magnifierConfig;
  const currentX = parseFloat(left) + lensSize / 2;
  const currentY = parseFloat(top) + lensSize / 2;
  const isFlipped = image.dataset.flipped === "true";

  const { bgX, bgY } = getLensCoordinates( isFlipped, rect, zoomLevel, lensSize, currentX, currentY,);
  setLensBgImage(rect, zoomLevel, image, { bgX, bgY });
}

function setupMagnifierEvents(magnifier, image) {
  image.addEventListener("mouseover", () => {
    magnifier.style.display = "flex";
  });
  image.addEventListener("mousemove", (e) => {
    moveMagnifierWithMouse(magnifier, image, e);
  });
  image.addEventListener("mousedown", () => {
    magnifier.classList.add("targeting");
  });
  image.addEventListener("mouseup", () => {
    magnifier.classList.remove("targeting");
  });
  image.addEventListener("mouseout", () => {
    magnifier.style.display = "none";
    magnifier.classList.remove("targeting");
  });
  image.addEventListener("load", () => {
    syncMagnifierBackground(magnifier, image);
  });
}

export function setupMagnifier(image = DOM.mainPuzzle) {
  const magnifier = createMagnifier();
  setupMagnifierEvents(magnifier, image);
}

function setLensBgImage({ width, height },  zoom, img, { bgX, bgY }) {
  const lens = magnifier.querySelector(".lens-content").style;

  lens.backgroundImage = `url(${img.src})`;
  lens.backgroundSize = `${width * zoom}px ${height * zoom}px`;
  lens.backgroundPosition = `${bgX}px ${bgY}px`;
}

function getLensCoordinates(isFlipped, { width, height }, zoom, size, x, y) {
  const bgX = isFlipped
    ? -((width - x) * zoom - size / 2)
    : -(x * zoom - size / 2);
  const bgY = isFlipped
    ? -((height - y) * zoom - size / 2)
    : -(y * zoom - size / 2);
  return { bgX, bgY };
}
