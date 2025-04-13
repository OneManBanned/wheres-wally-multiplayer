export const PUZZLES = window.PUZZLES || [
    "/images/wallyspace.jpg",
    "/images/wallysnow.jpg",
    "/images/wallyrace.jpg",
    "/images/wallybeach.jpg",
    "/images/wallyblue.jpg",
];

export const PLAYER_ID = window.PLAYER_ID || "default-player-id";
export const GAME_DURATION = window.GAME_DURATION || 300000;

export const magnifierConfig = {
  zoomLevel: 2,
  lensSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--lens-size"), 10,) || 140,
};
