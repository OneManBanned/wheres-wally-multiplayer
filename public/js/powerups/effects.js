import { PUZZLES } from "../constants.js";
import { DOM } from "../main.js";
import { setupConfetti } from "../ui/animations.js";
import { syncMagnifierBackground } from "../ui/magnifier.js";
import { getPathFromURL } from "../utils/utils.js";

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

  const { puzzles, startTime, playerEffects } = activeHint;
  if (Date.now() - startTime > 5000) return;

  mutations.forEach((mutation) => {
      console.log("inside observer")
    if (mutation.attributeName === "src") {
      const newSrc = DOM.mainPuzzle.src;
      const currentPuzzlePath = getPathFromURL(newSrc);
      const currentPuzzleIdx = PUZZLES.indexOf(currentPuzzlePath);

      if (currentPuzzleIdx !== -1 && puzzles[currentPuzzleIdx]) {
        console.log(`Puzzle switched to ${currentPuzzleIdx}`);
        // Update activeHint puzzleIdx
        activeHint.puzzleIdx = currentPuzzleIdx;
        // Reapply hint with new coordinates
        overlayHintPowerUp(
          {
            puzzleIdx: currentPuzzleIdx,
            puzzles,
          },
          playerEffects
        );
      }
    }
  });
});

// Initialize observer on game start
export function initializeHintObserver() {
  observer.observe(DOM.mainPuzzle, { attributes: true, attributeFilter: ["src"] });
}

let activeHint = null;
export function overlayHintPowerUp(effect, effectsArr) {

    let { puzzleIdx, puzzles } = effect;
    let { x: wallyX, y: wallyY } = puzzles[puzzleIdx].characters.wally

    const currentPuzzlePath = getPathFromURL(DOM.mainPuzzle.src);
    if (currentPuzzlePath !== PUZZLES[puzzleIdx]) return;

 activeHint = {
    puzzleIdx,
    puzzles,
    wallyX,
    wallyY,
    startTime: activeHint?.startTime || Date.now(), // Preserve initial startTime
    playerEffects: effectsArr,
  };

    if (effectsArr.includes("screenFlip")) {
        wallyX = 100 - wallyX;
        wallyY = 100 - wallyY;
    }

    // Calculate radius for 40% area
    const rect = DOM.mainPuzzle.getBoundingClientRect();
    const area = rect.width * rect.height;
    const circleArea = 0.4 * area; // 40% of puzzle area
    const radiusPx = Math.sqrt(circleArea / Math.PI);
    const radiusPercent = (radiusPx / rect.width) * 100;

    // Create or reuse overlay
    let overlay = DOM.mainPuzzleContainer.querySelector(".blur-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "blur-overlay";
        DOM.mainPuzzleContainer.appendChild(overlay);
    }

    // Set radius and activate
    const props = {
        "--hint-x": `${wallyX}%`,
        "--hint-y": `${wallyY}%`,
        "--hint-radius": `${radiusPercent}%`,
    }
    Object.entries(props).forEach(([key, value]) => {
        overlay.style.setProperty(key, value)
    })
    overlay.classList.add("active");

    // Ensure magnifier shows clear image
    syncMagnifierBackground(document.getElementById("magnifier"), DOM.mainPuzzle);
}


export function overlayHintCleanup() {
  const overlay = DOM.mainPuzzleContainer.querySelector(".blur-overlay");
  if (overlay) {
    // Apply fadeOut animation
    overlay.classList.add("fadeOut");
    // Delay removing active class and DOM removal until fadeOut completes
    setTimeout(() => {
      overlay.classList.remove("active");
      overlay.remove();
    }, 300); // Match fadeOut duration
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
        let {puzzleIdx, puzzles, wallyX, wallyY} = activeHint;
        overlayHintPowerUp({puzzleIdx, puzzles, wallyX, wallyY}, effectsArr)
    }

  DOM.mainPuzzle.classList.remove("spin-to-normal");
  DOM.mainPuzzleContainer.classList.add("flipped");
  DOM.mainPuzzle.dataset.flipped = "true";
  void DOM.mainPuzzle.offsetHeight;
  DOM.mainPuzzle.classList.add("spin-to-upside-down");
}

export function screenFlipCleanup(effectsArr) {

    if (activeHint && effectsArr.includes("overlayHint")) {
        let {puzzleIdx, puzzles, wallyX, wallyY} = activeHint;
        overlayHintPowerUp({puzzleIdx, puzzles, wallyX, wallyY}, effectsArr)
    }

  DOM.mainPuzzle.classList.remove("spin-to-upside-down");
  DOM.mainPuzzleContainer.classList.remove("flipped");
  DOM.mainPuzzle.dataset.flipped = "false";
  DOM.mainPuzzle.classList.add("spin-to-normal");
  DOM.mainPuzzle.style.transform = "rotate(0deg)";
  void DOM.mainPuzzle.offsetHeight;
}
