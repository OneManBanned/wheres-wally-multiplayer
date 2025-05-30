import { v4 as uuidv4 } from "uuid"
import { EFFECT_TYPES, WS_MESSAGE_TYPES } from "../constants.js";
import { puzzles } from "../models/puzzles.js";

export class EffectService {
    constructor(stateManager, webSocketService) {
        this.stateManager = stateManager;
        this.webSocketService = webSocketService;
    }

    applyEffect( powerUp, target, gameData, puzzleIdx) {
        const activeEffects = gameData.playerStats[target].activeEffects;
        const activeEffectsIdx = activeEffects.findIndex(e => e.name === powerUp.name)
        const effectAlreadyActive = activeEffectsIdx !== -1;
        const { duration } = powerUp;

        if (effectAlreadyActive) {
            const effect = activeEffects[activeEffectsIdx];
             effect.duration += duration; 
            const newEndTime = effect.startTime + effect.duration;
            const remainingTime = newEndTime - Date.now();
            const newDuration = remainingTime + duration;

            if (remainingTime > 0) {
                this.stateManager.removeEffectTimeout(effect.effectId)
                const timeout = this.scheduleEffectTimeout( target, newDuration, effect.effectId, effect.name);
                this.stateManager.setEffectTimeout(effect.effectId, timeout)
            } else {
                this.cleanupEffect(target, effect.effectId, gameData)
            }
        } else {
            const effectId = uuidv4();
            const effect = { ...powerUp, startTime: Date.now(), effectId, duration, puzzleIdx, puzzles};
            activeEffects.push(effect);

            this.webSocketService.sendToGamePlayers(gameData.gameId, {
                type: WS_MESSAGE_TYPES.APPLY_EFFECT,
                playerStats: gameData.playerStats,
                target,
                effect
            })

            const timeout = this.scheduleEffectTimeout(target, duration, effectId, effect.name)
            this.stateManager.setEffectTimeout(effectId, timeout)
        }
    }

    scheduleEffectTimeout(target, duration, effectId, effectName) {
        return setTimeout(() => {
            const result = this.stateManager.getGameByPlayerId(target);
            if (result) {
                const { gameData: currentGameData } = result;
                const activeEffects = currentGameData.playerStats[target].activeEffects;

                currentGameData.playerStats[target].activeEffects = activeEffects.filter(
                    e => e.effectId !== effectId
                );

                this.webSocketService.sendToGamePlayers(currentGameData.gameId, {
                    type: WS_MESSAGE_TYPES.CLEANUP_EFFECT,
                    playerStats: currentGameData.playerStats,
                    target,
                    effectsArr: [effectName],
                })

                this.stateManager.removeEffectTimeout(effectId);
            }
        }, duration)
    }


    cancelNegativeEffects(playerId, gameData) {
        const playerStats = gameData.playerStats[playerId];
        const activeEffects = playerStats.activeEffects;

        const negativeEffects = activeEffects.filter(e => e.type === EFFECT_TYPES.NEGATIVE)
        if (negativeEffects.length === 0) return;

        negativeEffects.forEach(effect => {
            this.stateManager.removeEffectTimeout(effect.effectId)
        })

        const effectsArr = negativeEffects.map(e => e.name);

        playerStats.activeEffects = activeEffects.filter(e => e.type !== EFFECT_TYPES.NEGATIVE)

        this.webSocketService.sendToGamePlayers(gameData.gameId, {
            type: WS_MESSAGE_TYPES.CLEANUP_EFFECT,
            playerStats: gameData.playerStats,
            target: playerId,
            effectsArr,
        })
    }

    cleanupEffect(target, effectId, gameData) {
        const activeEffects = gameData.playerStats[target].activeEffects;
        const effectIdx = activeEffects.findIndex(e => e.effectId === effectId)

        if (effectIdx !== -1) {
            const effect = activeEffects[effectIdx];
            activeEffects.splice(effectIdx, 1)

            this.webSocketService.sendToGamePlayers(gameData.gameId, {
                type: WS_MESSAGE_TYPES.CLEANUP_EFFECT,
                playerStats: gameData.playerStats,
                target,
                effectsArr: [effect.name],
            })

            this.stateManager.removeEffectTimeout(effectId)
        }
    }
}
