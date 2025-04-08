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

export function setEffectTimeout(name, duration, cleanUpFn, ws) {
    return setTimeout(() => {
        const activeEffect = getPlayerEffectsFromStats(getPlayerStats(), PLAYER_ID)
        cleanUpFn();
        const effectIdx = activeEffect.findIndex((item) => item.name === name);
        if (effectIdx !== -1) activeEffect.splice(effectIdx, 1);
        wsSend(ws, { type: "activeEffectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID });
    }, duration);
}

export function applyPowerUp(powerUp, target, ws, idx = null) {
    if (PLAYER_ID === target) {

        const activeEffect = getPlayerEffectsFromStats(getPlayerStats(), target)
        const activeEffectIdx = activeEffect.findIndex(e => e.name === powerUp.name);

        let effectAlreadyActive = activeEffectIdx !== -1;
        const { duration, cleanUpFn, name } = powerUp;

        if (effectAlreadyActive) {
            // Power--up already active extend duration.
            const existingEffect = activeEffect[activeEffectIdx];
            const newDuration = combineEffectDurations(existingEffect, duration);

            clearTimeout(existingEffect.timeoutId);
            existingEffect.duration = newDuration;
            existingEffect.startTime = Date.now();

            existingEffect.timeoutId = setEffectTimeout(name, newDuration, cleanUpFn, ws);
        } else {
            // Power-up not active - activate
            powerUp.fn(idx);
            const effect = {
                ...powerUp,
                startTime: Date.now(),
                timeoutId: setEffectTimeout(name, duration, cleanUpFn, ws),
            };

            activeEffect.push(effect);
        }

        wsSend(ws, {type: "activeEffectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID});
    }
}

export function cancelNegativePowerUps(playerId, ws) {

    const activeEffect = getPlayerEffectsFromStats(getPlayerStats(), playerId)

    const negativeEffectsArr = activeEffect.filter(e => e.type === "negative");

    if (negativeEffectsArr.length === 0) return;

    negativeEffectsArr.forEach((effect) => {
        const powerUpIdx = powerUpsObj[effect.char]
            .findIndex(powerUp => powerUp.name === effect.name);

        // call clean-up function for negative effect
        clearTimeout(effect.timeoutId);
        powerUpsObj[effect.char][powerUpIdx].cleanUpFn();
        const activeIdx = activeEffect.findIndex(e => e.name === effect.name);
        // remove negative effect from active effect array
        activeEffect.splice(activeIdx, 1);
    });

    wsSend(ws, { type: "activeEffectUpdate", playerStats: getPlayerStats(), playerId: PLAYER_ID });
}



function combineEffectDurations(active, powerUpDuration) {
    const elapsed = Date.now() - active.startTime;
    const remaining = active.duration - elapsed;
    return Math.max(0, remaining) + powerUpDuration;
}

export const getPlayerEffectsFromStats = (stats, id) => stats[id].activeEffect
