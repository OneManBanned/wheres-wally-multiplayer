import { getPlayerStats } from "../game/state.js";
import { PUZZLES, PLAYER_ID } from "../constants.js";
import { startGameTimer, setStartTime, isGameOver, setGameOver } from "../game/game.js";
import { applyPowerUp, cancelNegativePowerUps, getPlayerEffectsFromStats, getRandomPowerUp } from "../powerups/powerups.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI } from "../ui/ui.js";

export const handlers = {
    paired: ({ foundArr, startTime, puzzleIdx }) => {
        setStartTime(startTime);
        switchPuzzle(PUZZLES, foundArr, puzzleIdx);
        updateScores(PLAYER_ID);
        showGame();
        startGameTimer();
    },

    updateFound: ({ foundArr, playerWhoFoundId, puzzleIdx }, ws) => {
        updateScores( PLAYER_ID);
        updateThumbnailUI(playerWhoFoundId, puzzleIdx);
        switchPuzzle(PUZZLES, foundArr, puzzleIdx);
        if (playerWhoFoundId === PLAYER_ID && !isGameOver)
            cancelNegativePowerUps(playerWhoFoundId, ws);
    },

    gameOver: () => {
        setGameOver();
        // TODO -show game over UI
    },

    opponentQuit: ({ gameId }) => {
        console.log(`Opponent quit game ${gameId} is over`);
        showLobby();
    },

    effectUpdate: () => {
        // TODO - display active effects UI for both players
        const opponetId = getOpponentId(getPlayerStats(), PLAYER_ID);

        updateActiveEffectsUI(PLAYER_ID);
        updateActiveEffectsUI(opponetId);
    },

    powerUpFound: ({ puzzleIdx, character, playerWhoFoundId }, ws) => {

        updateFoundCharacterUI(puzzleIdx, character);

        const positiveEffectsTarget = playerWhoFoundId;
        const negativeEffectTarget = getOpponentId(getPlayerStats(), playerWhoFoundId);

        const powerUp = getRandomPowerUp(character);

        switch (character) {
            case "odlaw":
                applyPowerUp(powerUp, negativeEffectTarget, ws);
                break;
            case "wenda":
                // wendas double effect implementation
                applyPowerUp(powerUp, positiveEffectsTarget, ws);
                break;
            case "whitebeard":
                applyPowerUp(powerUp, positiveEffectsTarget, ws, puzzleIdx);
                break;
        }
    },
};

export const getOpponentId = (stats, player) =>
    Object.keys(stats).filter((id) => id !== player)[0];

function updateActiveEffectsUI(player) {
    const activeEffects = getPlayerEffectsFromStats(getPlayerStats(), player);

    console.log(`${player === PLAYER_ID ? "player" : "opponent"}: `);

    if (activeEffects.length > 0) {
        activeEffects.forEach((effect) => {
            console.log(`${effect.name} is active for ${effect.duration}`);
        });
    } else {
        console.log("No active effects");
    }
}
