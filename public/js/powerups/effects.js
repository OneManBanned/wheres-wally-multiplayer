import { DOM } from "../main.js";
import { setupConfetti } from "../ui/animations.js";

export const powerUpsObj = {
  odlaw: [
    { name: "screenFlip", type: "negative", fn: screenFlipPowerUp, cleanUpFn: screenFlipCleanup, duration: 10000, char: "odlaw"},
    { name: "confetti", type: "negative", fn: confettiPowerUp, cleanUpFn: confettiCleanup, duration: 15000, char: "odlaw" },
  ],
  wenda: [
    { name: "lensBlur", type: "negative", fn: lensBlurPowerUp, cleanUpFn: lensBlurCleanup, duration: 15000, char: "wenda" },
  ],
  whitebeard: [
    { name: "overlayHint", type: "positive", fn: overlayHintPowerUp, cleanUpFn: overlayHintCleanup, duration: 15000, char: "whitebeard"},
  ],
};

function lensBlurPowerUp() {
  console.log("Wenda lens blur activated!");

  const lens = magnifier.querySelector(".lens-content");
  if (!lens) {
    console.error("Lens content not found!");
    return;
  }

  lens.classList.add("blurred-lens");

}

function lensBlurCleanup() {
    console.log("lensBlur clean-up called")

  const lens = magnifier.querySelector(".lens-content");
  if (!lens) {
    console.error("Lens content not found!");
    return;
  }

    lens.classList.remove("blurred-lens");
}

function lensGrowPowerUp(target) {
}



function overlayHintPowerUp(target) {}



function overlayHintCleanup(target) {
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

function confettiPowerUp() {

  const confettiBottomLeft = setupConfetti({ x: 0, y: 1.1 }, 60);
  const confettiBottomRight = setupConfetti({ x: 1, y: 1.1 }, 120);
  const confettiMiddleBottom = setupConfetti({ x: 0.5, y: 1.1 }, 90);

  cleanupState.set([confettiBottomLeft, confettiMiddleBottom, confettiBottomRight]);
}

function confettiCleanup() {
    cleanupState.clear();
}

function screenFlipPowerUp() {
  DOM.mainPuzzle.classList.remove("spin-to-normal");
  DOM.mainPuzzleContainer.classList.add("flipped");
  DOM.mainPuzzle.dataset.flipped = "true"; 
  void DOM.mainPuzzle.offsetHeight; 
  DOM.mainPuzzle.classList.add("spin-to-upside-down");
}

function screenFlipCleanup() {
  DOM.mainPuzzle.classList.remove("spin-to-upside-down");
  DOM.mainPuzzleContainer.classList.remove("flipped");
  DOM.mainPuzzle.dataset.flipped = "false";
  DOM.mainPuzzle.classList.add("spin-to-normal");
  DOM.mainPuzzle.style.transform = "rotate(0deg)"; 
  void DOM.mainPuzzle.offsetHeight; 
}
