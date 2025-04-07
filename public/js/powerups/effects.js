import { DOM } from "../main.js";
import { setupConfetti } from "../ui/animations.js";

export const powerUpsObj = {
  odlaw: [
    { name: "screenFlip", type: "negative", fn: screenFlipPowerUp, cleanUpFn: screenFlipCleanup, duration: 10000, char: "odlaw"},
    { name: "confetti", type: "negative", fn: confettiPowerUp, cleanUpFn: confettiCleanup, duration: 15000, char: "odlaw" },
  ],
  wenda: [
    { name: "lensBlur", type: "negative", fn: blurLensPowerUp, char: "wenda" },
    { name: "lensGrow", type: "positive", fn: lensGrowPowerUp, char: "wenda" },
  ],
  whitebeard: [
    { name: "overlayHint", type: "positive", fn: overlayHintPowerUp, char: "whitebeard" },
  ],
};

export function blurLensPowerUp(target) {
  console.log(`${target} blurs lens!`);
}
export function lensGrowPowerUp(target) {
  console.log(`${target} increased lens size!`);
}
export function overlayHintPowerUp(target) {
  console.log(`${target} shows hint overlay!`);
}

const cleanupState = (() => {
    let cleanUpArr = [];
    return {
        get: () => cleanUpArr,
        set: (arr) => cleanUpArr = arr,
        clear: () => {
            cleanUpArr.forEach(fn => fn())
            cleanUpArr = [];
        }
    }
})()

export function confettiPowerUp() {
  const confettiBottomLeft = setupConfetti({ x: 0, y: 1.1 }, 60);
  const confettiBottomRight = setupConfetti({ x: 1, y: 1.1 }, 120);
  const confettiMiddleBottom = setupConfetti({ x: 0.5, y: 1.1 }, 90);

  cleanupState.set([confettiBottomLeft, confettiMiddleBottom, confettiBottomRight]);
}

export function confettiCleanup() {
    cleanupState.clear();
}

export function screenFlipPowerUp() {
  DOM.mainPuzzle.classList.remove("spin-to-normal");
  DOM.mainPuzzleContainer.classList.add("flipped");
  DOM.mainPuzzle.dataset.flipped = "true"; 
  void DOM.mainPuzzle.offsetHeight; 
  DOM.mainPuzzle.classList.add("spin-to-upside-down");
}

export function screenFlipCleanup() {
  DOM.mainPuzzle.classList.remove("spin-to-upside-down");
  DOM.mainPuzzleContainer.classList.remove("flipped");
  DOM.mainPuzzle.dataset.flipped = "false";
  DOM.mainPuzzle.classList.add("spin-to-normal");
  DOM.mainPuzzle.style.transform = "rotate(0deg)"; 
  void DOM.mainPuzzle.offsetHeight; 
}
