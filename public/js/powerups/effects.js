import { PUZZLES } from "../constants.js";
import { DOM } from "../main.js";
import { setupConfetti } from "../ui/animations.js";
import { syncMagnifierBackground } from "../ui/magnifier.js";
import { getPathFromURL } from "../utils/utils.js";

const lensGrowState = {
  isTransitioning: false,
  targetSize: "140px", // Default size
};

let activeHint = null;

export function lensBlurPowerUp() {
  const lens = magnifier.querySelector(".lens-content");
  lens.classList.add("blurred-lens");
}

export function lensBlurCleanup() {
  const lens = magnifier.querySelector(".lens-content");
  lens.classList.remove("blurred-lens");
}

export function lensGrowPowerUp() {
  const magnifier = document.getElementById("magnifier");
  document.querySelector(":root").style.setProperty("--lens-size", "180px");
  syncMagnifierBackground(magnifier);

  lensGrowState.isTransitioning = true;
  lensGrowState.targetSize = "180px";
  const startTime = performance.now();
  const duration = 300;
  const updateBackground = (currentTime) => {
    syncMagnifierBackground(magnifier);
    if (currentTime - startTime < duration) {
      requestAnimationFrame(updateBackground);
    }
  };
  requestAnimationFrame(updateBackground);
}

export function lensGrowCleanup() {
  const magnifier = document.getElementById("magnifier");
  document.querySelector(":root").style.setProperty("--lens-size", "140px");
  syncMagnifierBackground(magnifier);

  lensGrowState.isTransitioning = true;
  lensGrowState.targetSize = "140px";
  const startTime = performance.now();
  const duration = 300;
  const updateBackground = (currentTime) => {
    syncMagnifierBackground(magnifier);
    if (currentTime - startTime < duration) {
      requestAnimationFrame(updateBackground);
    }
  };
  requestAnimationFrame(updateBackground);
}

// Setup MutationObserver for puzzle switches
const observer = new MutationObserver((mutations) => {
  if (!activeHint) return;

  const { puzzles, playerEffects } = activeHint;

  mutations.forEach((mutation) => {
    if (mutation.attributeName === "src") {
      const newSrc = DOM.mainPuzzle.src;
      const currentPuzzlePath = getPathFromURL(newSrc);
      const currentPuzzleIdx = PUZZLES.indexOf(currentPuzzlePath);

      if (currentPuzzleIdx !== -1 && puzzles[currentPuzzleIdx]) {
        activeHint.puzzleIdx = currentPuzzleIdx;
        overlayHintPowerUp(
          { puzzleIdx: currentPuzzleIdx, puzzles },
          playerEffects,
        );
      }
    }
  });
});

// Initialize observer on game start
export function initializeHintObserver() {
  observer.observe(DOM.mainPuzzle, {
    attributes: true,
    attributeFilter: ["src"],
  });
}


export function overlayHintPowerUp(effect, effectsArr) {
  let { puzzleIdx, puzzles } = effect;
  let { x: wallyX, y: wallyY } = puzzles[puzzleIdx].characters.wally;

  const currentPuzzlePath = getPathFromURL(DOM.mainPuzzle.src);
  if (currentPuzzlePath !== PUZZLES[puzzleIdx]) return;

  activeHint = {
    puzzleIdx,
    puzzles,
    playerEffects: effectsArr,
  };

  if (effectsArr.includes("screenFlip")) {
    wallyX = 100 - wallyX;
    wallyY = 100 - wallyY;
  }

  const radiusPercent = calculateRadius()

  // Off-center Wally within the circle
  const maxOffset = radiusPercent * 0.5; // 70% of radius (~20%)
  const offsetX = Math.random() * maxOffset * (Math.random() > 0.5 ? 1 : -1);
  const offsetY = Math.random() * maxOffset * (Math.random() > 0.5 ? 1 : -1);
  const newX = wallyX + offsetX;
  const newY = wallyY + offsetY;

  // Clamp to prevent overflow (10% of radius margin)
  const minX = radiusPercent * 0.1;
  const maxX = 100 - minX;
  const minY = radiusPercent * 0.1;
  const maxY = 100 - minY;
  const clampedX = Math.max(minX, Math.min(maxX, newX));
  const clampedY = Math.max(minY, Math.min(maxY, newY));

  // Create or reuse overlay
  let overlay = DOM.mainPuzzleContainer.querySelector(".blur-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "blur-overlay";
    DOM.mainPuzzleContainer.appendChild(overlay);
  }

  // Set radius and activate
  const props = {
    "--hint-x": `${clampedX}%`,
    "--hint-y": `${clampedY}%`,
    "--hint-radius": `${radiusPercent}%`,
  };
  Object.entries(props).forEach(([key, value]) => {
    overlay.style.setProperty(key, value);
  });
  overlay.classList.add("active");

  // Ensure magnifier shows clear image
  syncMagnifierBackground(document.getElementById("magnifier"), DOM.mainPuzzle);
}

export function overlayHintCleanup() {
  const overlay = DOM.mainPuzzleContainer.querySelector(".blur-overlay");
  if (overlay) {
    overlay.classList.add("fadeOut");
    setTimeout(() => {
      overlay.classList.remove("active");
      overlay.remove();
    }, 300);
  }

  activeHint = null;
  syncMagnifierBackground(document.getElementById("magnifier"), DOM.mainPuzzle);
}

const cleanupState = (() => {
  let cleanUpArr = [];
  return {
    get: () => cleanUpArr,
    set: (arr) => (cleanUpArr = arr),
    clear: () => {
      cleanUpArr.forEach((fn) => fn());
      cleanUpArr = [];
    },
  };
})();

export function confettiPowerUp() {
  const confettiBottomLeft = setupConfetti({ x: 0, y: 1.1 }, 60);
  const confettiBottomRight = setupConfetti({ x: 1, y: 1.1 }, 120);
  const confettiMiddleBottom = setupConfetti({ x: 0.5, y: 1.1 }, 90);

  cleanupState.set([
    confettiBottomLeft,
    confettiMiddleBottom,
    confettiBottomRight,
  ]);
}

export function confettiCleanup() {
  cleanupState.clear();
}

export function screenFlipPowerUp(effect, effectsArr) {
  if (activeHint && effectsArr.includes("overlayHint")) {
    let { puzzleIdx, puzzles } = activeHint;
    overlayHintPowerUp({ puzzleIdx, puzzles }, effectsArr);
  }

  DOM.mainPuzzle.classList.remove("spin-to-normal");
  DOM.mainPuzzleContainer.classList.add("flipped");
  DOM.mainPuzzle.dataset.flipped = "true";
  void DOM.mainPuzzle.offsetHeight;
  DOM.mainPuzzle.classList.add("spin-to-upside-down");
}

export function screenFlipCleanup(effectsArr) {
  if (activeHint && effectsArr.includes("overlayHint")) {
    let { puzzleIdx, puzzles } = activeHint;
    overlayHintPowerUp({ puzzleIdx, puzzles }, effectsArr);
  }

  DOM.mainPuzzle.classList.remove("spin-to-upside-down");
  DOM.mainPuzzleContainer.classList.remove("flipped");
  DOM.mainPuzzle.dataset.flipped = "false";
  DOM.mainPuzzle.classList.add("spin-to-normal");
  DOM.mainPuzzle.style.transform = "rotate(0deg)";
  void DOM.mainPuzzle.offsetHeight;
}

  // Calculate radius for 40% area
  function calculateRadius() {
      const rect = DOM.mainPuzzle.getBoundingClientRect();
      const area = rect.width * rect.height;
      const circleArea = 0.4 * area; // 40% of puzzle area
      const radiusPx = Math.sqrt(circleArea / Math.PI);
      const radiusPercent = (radiusPx / rect.width) * 100;
      return radiusPercent

  }

export function flashPowerUp(effect, effectsArr) {
  const { puzzleIdx, puzzles } = effect;
  const characters = puzzles[puzzleIdx]?.characters || {};

  const currentPuzzlePath = getPathFromURL(DOM.mainPuzzle.src);
  if (currentPuzzlePath !== PUZZLES[puzzleIdx]) return;

  const isFlipped = effectsArr.includes("screenFlip");

  // Create flashes for each character except Whitebeard
  Object.entries(characters).forEach(([charName, { x, y }]) => {
    if (charName === "whitebeard") return; // Skip Whitebeard

    const flash = document.createElement("div");
    flash.className = "flash-star";
    
    // Apply screenFlip if active
    const posX = isFlipped ? 100 - x : x;
    const posY = isFlipped ? 100 - y : y;

    // Position flash (center-aligned)
    flash.style.left = `calc(${posX}% - 12px)`; // Offset by half width (24px / 2)
    flash.style.top = `calc(${posY}% - 12px)`; // Offset by half height
    DOM.mainPuzzleContainer.appendChild(flash);
  });
}

export function flashCleanup() {
  const flashes = DOM.mainPuzzleContainer.querySelectorAll(".flash-star");
  flashes.forEach((flash) => {
    flash.classList.remove("fadeOut");
  });
}
