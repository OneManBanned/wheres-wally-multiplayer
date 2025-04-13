import { magnifierConfig } from "../constants.js";
import { DOM } from "../main.js";
import { setupConfetti } from "../ui/animations.js";
import { syncMagnifierBackground } from "../ui/magnifier.js";

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
        magnifier.style.height = "180px";
        magnifier.style.width = "180px";
        syncMagnifierBackground(magnifier); // Adjust lens background
}
export function lensGrowCleanup() { 
     const magnifier = document.getElementById("magnifier");
        magnifier.style.height = `${magnifierConfig.lensSize}px`; // Revert to original
        magnifier.style.width = `${magnifierConfig.lensSize}px`;
        syncMagnifierBackground(magnifier); // Adjust lens background
}

export function overlayHintPowerUp() { }

export function overlayHintCleanup(target) {
    console.log(`${target} shows hint overlay!`);
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

