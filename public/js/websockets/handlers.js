import { PUZZLES, PLAYER_ID } from "../constants.js";
import { startGameTimer, setStartTime, isGameOver, setGameOver } from "../game/game.js";
import { applyPowerUp, cancelNegativePowerUps, getRandomPowerUp } from "../powerups/powerups.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI, } from "../ui/ui.js";

export const handlers = {
    paired: ({ foundArr, startTime, playerStats, puzzleIdx }) => {
        setStartTime(startTime);
        switchPuzzle(PUZZLES, foundArr, puzzleIdx);
        updateScores(playerStats, PLAYER_ID);
        showGame();
        startGameTimer();
    },

    updateFound: ({ foundArr, playerStats, playerWhoFoundId, puzzleIdx }, ws) => {
        updateScores(playerStats, PLAYER_ID);
        updateThumbnailUI(playerWhoFoundId, puzzleIdx);
        switchPuzzle(PUZZLES, foundArr, puzzleIdx);
        if (playerWhoFoundId === PLAYER_ID && !isGameOver) 
            cancelNegativePowerUps(playerWhoFoundId, playerStats, ws);
    },

    gameOver: () => {
        setGameOver();
        // TODO -show game over UI
    },

    opponentQuit: ({ gameId }) => {
        console.log(`Opponent quit game ${gameId} is over`);
        showLobby();
    },

    activeEffectUpdate: ({ playerStats }) => {
        // TODO - display active effects UI for both players
        Object.keys(playerStats).forEach((key) => {
            playerStats[key].activeEffect.forEach((effect) => {
                // console.log(`${key} has power-up ${effect.name} currently running for ${effect.duration}`)
            });
        });
    },

    powerUpFound: ({ puzzleIdx, character, playerWhoFoundId, playerStats }, ws) => {

        updateFoundCharacterUI(puzzleIdx, character);

        const positiveEffectsTarget = playerWhoFoundId;
        const negativeEffectTarget = Object.keys(playerStats).filter(
            (id) => id != playerWhoFoundId,
        )[0];

        const powerUp = getRandomPowerUp(character);

        switch (character) {
            case "odlaw":
                applyPowerUp(powerUp, negativeEffectTarget, playerStats, ws);
                break;
            case "wenda":
                // wendas double effect implementation
                applyPowerUp(powerUp, { positiveEffectsTarget }, playerStats, ws);
                break;
            case "whitebeard":
                applyPowerUp( powerUp, positiveEffectsTarget, playerStats, ws, puzzleIdx);
                break;
        }
    },
};
