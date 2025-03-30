import { DOM } from "../main.js";
import { isAnimatingFill } from "./ui.js";

export const magnifierConfig = {
  zoomLevel: 2,
  lensSize: parseInt( getComputedStyle(document.documentElement).getPropertyValue("--lens-size"), 10,),
};

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

function updateMagnifierPosition(magnifier, e, image) {
  if (isAnimatingFill) return;

  const rect = image.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const isFlipped = image.dataset.flipped === "true"; // Position magnifier

  magnifier.style.left = `${x - magnifierConfig.lensSize / 2}px`;
  magnifier.style.top = `${y - magnifierConfig.lensSize / 2}px`; // Update lens background

  const lens = magnifier.querySelector(".lens-content");

  const bgX = isFlipped
    ? -((rect.width - x) * magnifierConfig.zoomLevel - magnifierConfig.lensSize / 2)
    : -(x * magnifierConfig.zoomLevel - magnifierConfig.lensSize / 2);

  const bgY = isFlipped
    ? -((rect.height - y) * magnifierConfig.zoomLevel - magnifierConfig.lensSize / 2)
    : -(y * magnifierConfig.zoomLevel - magnifierConfig.lensSize / 2);

  lens.style.backgroundImage = `url(${image.src})`;
  lens.style.backgroundSize = `${rect.width * magnifierConfig.zoomLevel}px ${rect.height * magnifierConfig.zoomLevel}px`;
  lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
}

function setupMagnifierEvents(magnifier, image) {
  image.addEventListener("mouseover", () => {
    magnifier.style.display = "flex";
  });
  image.addEventListener("mousemove", (e) => {
    updateMagnifierPosition(magnifier, e, image);
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
}

export function setupMagnifier(image = DOM.mainPuzzle) {
  const magnifier = createMagnifier();
  setupMagnifierEvents(magnifier, image);
}
