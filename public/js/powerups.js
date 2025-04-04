import { DOM } from "./main.js";
import { setupConfetti } from "./ui/animations.js";

// Power-up definitions: { name, type, fn, cleanUp, duration}

export let cleanUpArr = [];
function setCleanUpArr(arr) {
    cleanUpArr = arr;
}

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
    { name: "overlayHint", type: "positive", fn: overlayHintPowerUp, char: "whitbeard" },
  ],
};

// Placeholder power-up functions (we’ll implement these later)
function blurLensPowerUp(target) {
  console.log(`${target} blurs lens!`);
}
function lensGrowPowerUp(target) {
  console.log(`${target} increased lens size!`);
}
function overlayHintPowerUp(target) {
  console.log(`${target} shows hint overlay!`);
}

// Export utility to get a random power-up for a character
export function getRandomPowerUp(character) {
  const available = powerUpsObj[character] || [];
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function confettiPowerUp() {
  const confettiBottomLeft = setupConfetti({ x: 0, y: 1.1 }, 60);
  const confettiBottomRight = setupConfetti({ x: 1, y: 1.1 }, 120);
  const confettiMiddleBottom = setupConfetti({ x: 0.5, y: 1.1 }, 90);

  cleanUpArr = [confettiBottomLeft, confettiMiddleBottom, confettiBottomRight];
}

export function confettiCleanup() {
    cleanUpArr.forEach(fn => fn())
    setCleanUpArr([])
}

export function screenFlipPowerUp() {
  DOM.mainPuzzleContainer.classList.add("flipped");
  DOM.mainPuzzle.dataset.flipped = "true";
  DOM.mainPuzzle.classList.add("spin-to-upside-down");
}

export function screenFlipCleanup() {
    DOM.mainPuzzle.classList.remove("spin-to-upside-down");
    DOM.mainPuzzle.classList.add("spin-to-normal");
    DOM.mainPuzzleContainer.classList.remove("flipped");
    DOM.mainPuzzle.dataset.flipped = "false";
}
