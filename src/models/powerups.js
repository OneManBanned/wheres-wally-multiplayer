export const powerUpsObj = {
  odlaw: [
    { name: "screenFlip", type: "negative", duration: 15000, char: "odlaw" },
    { name: "confetti", type: "negative", duration: 15000, char: "odlaw" },
  ],
  wenda: [
    { name: "lensBlur", type: "negative", duration: 15000, char: "wenda" },
    { name: "lensGrow", type: "positive", duration: 15000, char: "wenda" },
  ],
  whitebeard: [
    { name: "overlayHint", type: "positive", duration: 5000, char: "whitebeard" },
    //{ name: "flashHint", type: "positive", duration: 5000, char: "whitebeard" },
  ],
};

export function getRandomPowerUp(character) {
  const powerUps = powerUpsObj[character];
  if (!powerUps || powerUps.length === 0) return null;
  return powerUps[Math.floor(Math.random() * powerUps.length)];
}
