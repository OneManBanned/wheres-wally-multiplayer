import { puzzles } from "../models/puzzles.js";
import { v4 as uuidv4 } from "uuid";
import { games, clients, GAME_DURATION, effectTimeouts } from "../app.js";
import { checkCharacterInRange, getGameByPlayerId, getGameWsByPlayerId, wsOpenSend } from "../utils/utils.js";
import { getRandomPowerUp } from "../models/powerups.js";
import { cleanupGame } from "../websockets.js";

export const startGame = (req, res) => {
    res.render("index", {
        puzzles: Object.values(puzzles).map((char) => char.img),
        playerId: (req.session.playerId = uuidv4()),
        gameDuration: GAME_DURATION,
    });
};

export const checkGuess = (req, res) => {
    const { puzzleIdx, x, y, playerId } = req.body;
    const characters = puzzles[puzzleIdx].characters;

    if (!characters)
        return res
            .status(400)
            .json({ success: false, error: "Invalid puzzle index" });

    let charFound = false;

    for (let character in characters) {
        const inRange = checkCharacterInRange(character, { x, y }, characters);

        if (inRange) {
            charFound = character;
            const result = getGameByPlayerId(playerId, games);

            if (!result || !result.gameData) {
                console.warn(`No game found for playerId ${playerId} in checkGuess`);
                return;
            }

            const { gameId, gameData } = result;
            const { opponentsWs, playersWs } = getGameWsByPlayerId(playerId, gameData, clients);
            const { foundArr, powerUpsArr, playerStats } = gameData;

            if (character === "waldo") {
                foundArr[puzzleIdx] = true;
                playerStats[playerId].wallysFound += 1;

                if (!foundArr.includes(false)) {
                    wsOpenSend([playersWs, opponentsWs], { type: "gameOver", reason: "allFound" });
                    wsOpenSend([playersWs, opponentsWs], { type: "updateFound", foundArr, playerStats, puzzleIdx, playerWhoFoundId: playerId });
                    cleanupGame(gameId, games, effectTimeouts) 
                } else {
                    cancelNegativePowerUps(playerId, playerStats, { opponentsWs, playersWs })
                    wsOpenSend([playersWs, opponentsWs], { type: "updateFound", foundArr, playerStats, puzzleIdx, playerWhoFoundId: playerId });
                }
            }
            
            if (character !== "waldo" && !powerUpsArr[puzzleIdx][character]) {
                powerUpsArr[puzzleIdx][character] = true;

                const powerUp = getRandomPowerUp(character);

                const opponentId = gameData.players.find(id => id !== playerId)
                let effectTargetId = powerUp.type === "positive" ? playerId : opponentId;

                applyEffect(gameData.playerStats[effectTargetId].activeEffects, powerUp, effectTargetId, gameData)

                wsOpenSend([playersWs, opponentsWs], { type: "powerUpFound", puzzleIdx, character, playerWhoFoundId: playerId })

            } else {
                charFound = false;
            }
    }
}
res.json({ charFound });
};


export function applyEffect(activeEffects, powerUp, target, gameData) {
    const activeEffectsIdx = activeEffects.findIndex(e => e.name === powerUp.name);
    let effectAlreadyActive = activeEffectsIdx !== -1;
    const { duration } = powerUp;

    if (effectAlreadyActive) {
        const effect = activeEffects[activeEffectsIdx];
        const originalEndTime = effect.startTime + effect.duration; 
        const newDuration = effect.duration + duration; 


        const oldTimeout = effectTimeouts.get(effect.effectId)
        if (oldTimeout) {
            clearTimeout(oldTimeout);
            effectTimeouts.delete(effect.effectId)
        }

        effect.duration = newDuration;

       const remainingTime = originalEndTime + duration - Date.now();
        if (remainingTime > 0) {
            const timeout = setEffectTimeout(target, remainingTime, effect.effectId, effect.name);
            effectTimeouts.set(effect.effectId, timeout);
        } else {
            cleanupEffect(target, effect.effectId, gameData);
        }

            console.log("duration extended",effectTimeouts.entries())
    } else {
        // Power-up not active - activate
        const effectId = uuidv4()
        const effect = { ...powerUp, startTime: Date.now(), effectId };
        activeEffects.push(effect);

        const { opponentsWs, playersWs } = getGameWsByPlayerId(target, gameData, clients)
        wsOpenSend([opponentsWs, playersWs], { type: "applyEffect", playerStats: gameData.playerStats, target, effect });

        const timeout = setEffectTimeout(target, duration, effectId, effect.name);
        effectTimeouts.set(effectId, timeout);

    }

}

export function setEffectTimeout(target, duration, effectId, effectName) {
    return setTimeout(() => {
        const game = getGameByPlayerId(target, games)
        if (game) {
            const { gameData } = game
            let activeEffects = gameData.playerStats[target].activeEffects

            gameData.playerStats[target].activeEffects = activeEffects.filter(e => e.effectId !== effectId);
            const { opponentsWs, playersWs } = getGameWsByPlayerId(target, gameData, clients);
            console.log("active effect after timeout: ", gameData.playerStats[target].activeEffects.map(e => e.name))
            wsOpenSend([opponentsWs, playersWs], { type: "cleanUpEffect", playerStats: gameData.playerStats, target, effectsArr: [effectName] });
            effectTimeouts.delete(effectId)
            console.log(effectTimeouts.entries())
        }
    }, duration);

}

export function cancelNegativePowerUps(playerId, playerStats, { playersWs, opponentsWs }) {

    let activeEffects = playerStats[playerId].activeEffects

    const negativeEffects = activeEffects.filter(e => e.type === "negative")


    negativeEffects.forEach(effect => {
        const timeout = effectTimeouts.get(effect.effectId);
        if (timeout) {
            clearTimeout(timeout); 
            effectTimeouts.delete(effect.effectId);
        }
    });

    const effectsArr = negativeEffects.map(e => e.name)

    playerStats[playerId].activeEffects = activeEffects.filter(e => e.type !== "negative");
    console.log("active effects after CancelNegative: ", playerStats[playerId].activeEffects.map(e => e.name))
    console.log(effectTimeouts.entries())
    wsOpenSend([opponentsWs, playersWs], { type: "cleanUpEffect", playerStats, target: playerId, effectsArr });
}
