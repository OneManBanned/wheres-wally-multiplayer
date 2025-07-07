export const GAME_DURATION =  5 //* 60 * 1000; // 5 minutes
export const PUZZLE_COUNT = 5;

export const CHARACTERS = {
  WALLY: "wally",
  ODLAW: "odlaw",
  WENDA: "wenda",
  WHITEBEARD: "whitebeard",
};

export const EFFECT_TYPES = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
};

export const EFFECTS = {
  SCREEN_FLIP: "screenFlip",
  CONFETTI: "confetti",
  LENS_BLUR: "lensBlur",
  LENS_GROW: "lensGrow",
  OVERLAY_HINT: "overlayHint",
};

export const WS_MESSAGE_TYPES = {
  JOIN: "join",
  GAME_TIMEOUT: "gameTimeout",
  GAME_OVER: "gameOver",
  OPPONENT_QUIT: "opponentQuit",
  PAIRED: "paired",
  UPDATE_FOUND: "updateFound",
  APPLY_EFFECT: "applyEffect",
  CLEANUP_EFFECT: "cleanUpEffect",
  POWER_UP_FOUND: "powerUpFound",
};

export const GAME_OVER_REASONS = {
  TIME_UP: "timeUp",
  ALL_FOUND: "allFound",
  OPPONENT_QUIT: "opponentQuit",
};
