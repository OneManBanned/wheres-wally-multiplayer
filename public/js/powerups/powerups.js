import { PLAYER_ID } from "../constants.js";
import { wsSend } from "../websockets/websockets.js";
import { powerUpsObj } from "./effects.js";

// Get a random power-up for a character
export function getRandomPowerUp(character) {
  const available = powerUpsObj[character] || [];
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function applyPowerUp(powerUp, target, playerStats, ws, idx = null) {
    if (PLAYER_ID === target) {
        const activeEffects = playerStats[target].activeEffect;
        const existingEffectIdx = activeEffects.findIndex(
            (item) => item.name === powerUp.name,
        );

        let effectAlreadyActive = existingEffectIdx !== -1;
        const { duration, cleanUpFn, name } = powerUp;

        if (effectAlreadyActive) {
            // Power--up already active extend duration.
            const existingEffect = activeEffects[existingEffectIdx];
            const newDuration = combineEffectDurations(existingEffect, duration);

            clearTimeout(existingEffect.timeoutId);
            existingEffect.duration = newDuration;
            existingEffect.startTime = Date.now();

            existingEffect.timeoutId = setEffectTimeout(name, newDuration, cleanUpFn, activeEffects,
                playerStats, ws,);
        } else {
            // Power-up not active - activate
            powerUp.fn(idx);
            const effect = {
                ...powerUp,
                startTime: Date.now(),
                timeoutId: setEffectTimeout(name, duration, cleanUpFn, activeEffects, playerStats, ws,),
            };

            activeEffects.push(effect);
        }

        wsSend(ws, {type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID});
    }
}

export function cancelNegativePowerUps(playerId, playerStats, ws) {
    const negativeEffectsArr = playerStats[playerId].activeEffect
        .filter(effect => effect.type === "negative");

    if (negativeEffectsArr.length === 0) return;

    negativeEffectsArr.forEach((activeEffect) => {
        const powerUpIdx = powerUpsObj[activeEffect.char]
            .findIndex(powerUp => powerUp.name === activeEffect.name);

        // call clean-up function for negative effect
        clearTimeout(activeEffect.timeoutId);
        powerUpsObj[activeEffect.char][powerUpIdx].cleanUpFn();
        const effectIdx = playerStats[playerId] .activeEffect
            .findIndex(item => item.name === activeEffect.name);

        // remove negative effect from active effect array
        playerStats[playerId].activeEffect.splice(effectIdx, 1);
    });

    wsSend(ws, { type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID });
}


export function setEffectTimeout(name, duration, cleanUpFn, activeEffects, playerStats, ws) {
    return setTimeout(() => {
        cleanUpFn();
        const effectIdx = activeEffects.findIndex((item) => item.name === name);
        if (effectIdx !== -1) activeEffects.splice(effectIdx, 1);
        wsSend(ws, { type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID });
    }, duration);
}

function combineEffectDurations(active, powerUpDuration) {
    const elapsed = Date.now() - active.startTime;
    const remaining = active.duration - elapsed;
    return Math.max(0, remaining) + powerUpDuration;
}
