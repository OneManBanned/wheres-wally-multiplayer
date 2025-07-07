import { PUZZLES, PLAYER_ID } from "../constants.js";
import { startGameTimer, setStartTime, setGameOver, } from "../game/game.js";
import { applyPowerUp, cleanupPowerUp } from "../powerups/powerups.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI, updateActiveEffectsUI, showGameOverScreen, } from "../ui/ui.js";
import { checkGameResult, getOpponentId } from "../utils/utils.js";

export const handlers = {
  paired: ({ foundArr, startTime, playerStats, puzzleIdx }) => {
    setStartTime(startTime);
    switchPuzzle(PUZZLES, foundArr, puzzleIdx);
    updateScores(playerStats, PLAYER_ID);
    showGame();
    startGameTimer();
  },

  updateFound: ({ foundArr, playerStats, playerWhoFoundId, puzzleIdx }) => {
    updateScores(playerStats, PLAYER_ID);
    updateThumbnailUI(playerWhoFoundId, puzzleIdx);
    switchPuzzle(PUZZLES, foundArr, puzzleIdx);
  },


  gameOver: ({game, reason}) => {
    setGameOver();
    showGameOverScreen(checkGameResult(game, reason))
  },

  opponentQuit: () => {
    showLobby();
  },

  applyEffect: ({ target, effect, playerStats }) => {
    const playerEffects = playerStats[target].activeEffects.map(e => e.name)

    if (target === PLAYER_ID) applyPowerUp(effect, playerEffects);
    
    updateActiveEffectsUI(playerStats, target, effect);
  },

  cleanUpEffect: ({ playerStats, target, effectsArr}) => {
      const playerEffects = playerStats[target].activeEffects.map(e => e.name)

    if (effectsArr.length > 0 && target === PLAYER_ID) {
      effectsArr.forEach( name => cleanupPowerUp(name, playerEffects))
    }

    updateActiveEffectsUI(playerStats, target);
  },

  powerUpFound: ({ character, puzzleIdx }) => updateFoundCharacterUI(puzzleIdx, character),
  
};

