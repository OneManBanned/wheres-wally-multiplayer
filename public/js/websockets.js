import { PUZZLES, PLAYER_ID } from "./game.js";
import { startGameTimer, setGameOver, setStartTime } from "./game.js";
import { getRandomPowerUp, powerUpsObj } from "./powerups.js";
import {
  showLobby,
  showGame,
  updateScores,
  updateFoundCharacterUI,
  switchPuzzle,
  updateThumbnailUI,
} from "./ui/ui.js";

export function initWebSocket(playerId) {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    ws.send(JSON.stringify({ type: "join", playerId }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("WebSocket message:", data);
    const handler = handlers[data.type];
    if (handler) handler(data, ws);
    else console.warn(`Unhandled message type: ${data.type}`);
  };

  ws.onclose = () => console.log("Disconnected from WebSocket server");
  ws.onerror = (e) => console.log("WebSocker error: ", e);
}

const handlers = {
  paired: ({ foundArr, startTime, playerStats, puzzleIdx }) => {
    setStartTime(startTime);
    switchPuzzle(PUZZLES, foundArr, puzzleIdx);
    updateScores(playerStats, PLAYER_ID);
    showGame();
    startGameTimer();
  },

  updateFound: ({ foundArr, playerStats, playerWhoFoundId, puzzleIdx }, ws) => {
    updateScores(playerStats, PLAYER_ID);
    cancelNegativePowerUps(playerWhoFoundId, playerStats, ws);
    updateThumbnailUI(playerWhoFoundId, puzzleIdx);
    switchPuzzle(PUZZLES, foundArr, puzzleIdx);
  },

  gameOver: () => {
    setGameOver();
    return alert("Game over");
  },

  opponentQuit: ({ gameId }) => {
    console.log(`Opponent quit game ${gameId} is over`);
    showLobby();
  },

  powerUpFound: (
    { puzzleIdx, character, playerWhoFoundId, playerStats },
    ws,
  ) => {
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
        applyPowerUp(
          powerUp,
          positiveEffectsTarget,
          playerStats,
          ws,
          puzzleIdx,
        );
        break;
    }
  },
};

function applyPowerUp(powerUp, target, playerStats, ws, idx = null) {
  if (PLAYER_ID === target) {
    const activeEffects = playerStats[target].activeEffect;
    const existingEffectIdx = activeEffects.findIndex(
      (item) => item.name === powerUp.name,
    );

    if (existingEffectIdx !== -1) {
      // Power-up already active extend duration.

      const existingEffect = activeEffects[existingEffectIdx];
      const elapsed = Date.now() - existingEffect.startTime;
      const remaining = existingEffect.duration - elapsed;
      const newDuration = Math.max(0, remaining) + powerUp.duration;

      clearTimeout(existingEffect.timeoutId);
      existingEffect.duration = newDuration;
      existingEffect.startTime = Date.now();

      existingEffect.timeoutId = setTimeout(() => {
        powerUp.cleanUpFn();
        const effectIdx = activeEffects.findIndex(
          (item) => item.name === powerUp.name,
        );
        if (effectIdx !== -1) activeEffects.splice(effectIdx, 1);
        ws.send(
          JSON.stringify({
            type: "activeEffectUpdate",
            playerStats,
            playerId: PLAYER_ID,
          }),
        );
      }, newDuration);

      console.log(`Extended ${powerUp.name} duration to ${newDuration}ms`);
    } else {
      powerUp.fn();
      const effect = {
        ...powerUp,
        startTime: Date.now(),
        timeoutId: setTimeout(() => {
          powerUp.cleanUpFn();
          const effectIdx = activeEffects.findIndex(
            (item) => item.name === powerUp.name,
          );
          if (effectIdx !== -1) activeEffects.splice(effectIdx, 1);
          ws.send(
            JSON.stringify({
              type: "activeEffectUpdate",
              playerStats,
              playerId: PLAYER_ID,
            }),
          );
        }, powerUp.duration),
      };

        activeEffects.push(effect)
        console.log(`Applied ${powerUp.name} for ${powerUp.duration}ms`)
    }

      ws.send(JSON.stringify({
          type: "activeEffectUpdate",
          playerStats,
          playerId: PLAYER_ID
      }))
  }
}

function cancelNegativePowerUps(playerId, playerStats, ws) {
  const negativeArr = playerStats[playerId].activeEffect.filter(
    (effect) => effect.type === "negative",
  );

  if (negativeArr.length === 0) return;

  negativeArr.forEach((active) => {
    const idx = powerUpsObj[active.char].findIndex(
      (powerUp) => powerUp.name === active.name,
    );
    powerUpsObj[active.char][idx].cleanUpFn();
  });

  const effectIdx = playerStats[playerId].activeEffect.findIndex(
    (item) => item.type === "negative",
  );
  playerStats[playerId].activeEffect.splice(effectIdx, 1);
  ws.send(
    JSON.stringify({
      type: "activeEffectUpdate",
      playerStats,
      playerId: PLAYER_ID,
    }),
  );
}
