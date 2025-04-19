import { PUZZLES, PLAYER_ID } from "../constants.js";
import { startGameTimer, setStartTime, setGameOver, } from "../game/game.js";
import { applyPowerUp, cleanupPowerUp } from "../powerups/powerups.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI, updateActiveEffectsUI, } from "../ui/ui.js";

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

  gameOver: ({reason}) => {
      console.log("Game Over due to ", reason)
    setGameOver();
    // TODO -show game over UI
  },

  opponentQuit: ({ gameId }) => {
    console.log(`Opponent quit game ${gameId} is over`);
    showLobby();
  },

  applyEffect: ({ target, effect, playerStats }) => {
      console.log("applying effect ", effect.name, " triggered by ", effect.char)
      const opponentId = Object.keys(playerStats).filter(id => id !== target)
      const playerEffects = playerStats[target].activeEffects.map(e => e.name)
      const opponentEffects = playerStats[opponentId].activeEffects.map(e => e.name)
      console.log("playereffects: ", playerEffects)
      console.log("opponenteffects: ", opponentEffects)
      console.log("----------------------")

      const {name, puzzleIdx, char} = effect;
    if (target === PLAYER_ID) {
      applyPowerUp(name, puzzleIdx);
    }
    updateActiveEffectsUI(playerStats, target, char, name);
  },

  cleanUpEffect: ({ playerStats, target, effectsArr}) => {
      console.log("cleaning up", effectsArr)
      const opponentId = Object.keys(playerStats).filter(id => id !== target)
      const playerEffects = playerStats[target].activeEffects.map(e => e.name)
      const opponentEffects = playerStats[opponentId].activeEffects.map(e => e.name)
      console.log("playereffects: ", playerEffects)
      console.log("opponenteffects: ", opponentEffects)
      console.log("----------------------")

    if (effectsArr.length > 0 && target === PLAYER_ID) {
      effectsArr.forEach( name => cleanupPowerUp(name))
    }

    updateActiveEffectsUI(playerStats, target);
  },

  powerUpFound: ({ character, puzzleIdx }) => {
    updateFoundCharacterUI(puzzleIdx, character);
  },
};

