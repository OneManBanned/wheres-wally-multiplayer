import { screenFlipPowerUp, screenFlipCleanup, confettiPowerUp, confettiCleanup, lensBlurPowerUp,
  lensBlurCleanup, lensGrowPowerUp, lensGrowCleanup, overlayHintPowerUp, overlayHintCleanup, } from "./effects.js";

export const effectFunctions = {
  screenFlip: { apply: screenFlipPowerUp, cleanup: screenFlipCleanup },
  confetti: { apply: confettiPowerUp, cleanup: confettiCleanup },
  lensBlur: { apply: lensBlurPowerUp, cleanup: lensBlurCleanup },
  lensGrow: { apply: lensGrowPowerUp, cleanup: lensGrowCleanup },
  overlayHint: { apply: overlayHintPowerUp, cleanup: overlayHintCleanup },
};

export function applyPowerUp(effectName, puzzleIdx) {
  const effectFn = effectFunctions[effectName]?.apply;
  if (effectFn) {
    effectFn(puzzleIdx); 
  } else {
    console.warn(`No apply function for effect: ${effectName}`);
  }
}

export function cleanupPowerUp(effectName) {
  const cleanupFn = effectFunctions[effectName]?.cleanup;
  if (cleanupFn) {
    cleanupFn();
  } else {
    console.warn(`No cleanup function for effect: ${effectName}`);
  }
}

export const getPlayerEffectsFromStats = (stats, id) => stats[id].activeEffects
