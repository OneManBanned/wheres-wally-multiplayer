export const PUZZLES = window.puzzles || [
    "/images/wallyspace.jpg",
    "/images/wallysnow.jpg",
    "/images/wallyrace.jpg",
    "/images/wallybeach.jpg",
    "/images/wallyblue.jpg",
];

export const PLAYER_ID = window.playerId || "default-player-id";

export const magnifierConfig = {
  zoomLevel: 2,
  lensSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--lens-size"), 10,) || 140,
};
