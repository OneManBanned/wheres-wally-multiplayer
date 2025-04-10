import { getPlayerStats } from "../game/state.js";
import { PLAYER_ID } from "../constants.js";
import { powerUpsObj } from "./effects.js";
import { wsSend } from "../websockets/websockets.js";

// Get a random power-up for a character
export function getRandomPowerUp(character) {
  const available = powerUpsObj[character] || [];
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function setEffectTimeout(name, duration, cleanUpFn) {
    return setTimeout(() => {
        const activeEffects = getPlayerEffectsFromStats(getPlayerStats(), PLAYER_ID)
        cleanUpFn();
        const effectIdx = activeEffects.findIndex((item) => item.name === name);
        if (effectIdx !== -1) activeEffects.splice(effectIdx, 1);
        wsSend({ type: "effectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID });
    }, duration);
}

export function applyEffect(powerUp, activeEffects, idx = null) {
        const activeEffectsIdx = activeEffects.findIndex(e => e.name === powerUp.name);
        let effectAlreadyActive = activeEffectsIdx !== -1;
        const { duration, cleanUpFn, name } = powerUp;

        if (effectAlreadyActive) {

            const effect = activeEffects[activeEffectsIdx];
            const newDuration = combineEffectDurations(effect, duration);

            clearTimeout(effect.timeoutId);
            effect.duration = newDuration;
            effect.startTime = Date.now();

            effect.timeoutId = setEffectTimeout(name, newDuration, cleanUpFn);
        } else {
            // Power-up not active - activate
            powerUp.fn(idx);
            const effect = {
                ...powerUp,
                startTime: Date.now(),
                timeoutId: setEffectTimeout(name, duration, cleanUpFn),
            };
            activeEffects.push(effect);
    }
}

export function applyPowerUp(powerUp, target, idx = null) {
    if (PLAYER_ID === target) {
    const playerStats = getPlayerStats();
    const activeEffects = getPlayerEffectsFromStats(playerStats, target)
    applyEffect(powerUp, activeEffects, idx = null)
    wsSend({type: "effectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID});
    }
}

export function cancelNegativePowerUps(playerId) {

    const activeEffects = getPlayerEffectsFromStats(getPlayerStats(), playerId)

    const negativeEffectsArr = activeEffects.filter(e => e.type === "negative");

    if (negativeEffectsArr.length === 0) return;

    console.log("negative effects", negativeEffectsArr)
    negativeEffectsArr.forEach((effect) => {
        const powerUpIdx = powerUpsObj[effect.char]
            .findIndex(powerUp =>  powerUp.name === effect.name);

        // call clean-up function for negative effect
        clearTimeout(effect.timeoutId);
        powerUpsObj[effect.char][powerUpIdx].cleanUpFn();
        const activeIdx = activeEffects.findIndex(e => e.name === effect.name);
        // remove negative effect from active effect array
        activeEffects.splice(activeIdx, 1);
    });

    wsSend({ type: "effectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID });
}

function combineEffectDurations(active, powerUpDuration) {
    const elapsed = Date.now() - active.startTime;
    const remaining = active.duration - elapsed;
    return Math.max(0, remaining) + powerUpDuration;
}

export const getPlayerEffectsFromStats = (stats, id) => stats[id].activeEffects
