import { PUZZLES, PLAYER_ID } from "./game.js";
import { startGameTimer, setGameOver, setStartTime } from "./game.js";
import { getRandomPowerUp, powerUpsObj } from "./powerups.js";
import { showLobby, showGame, updateScores, updateFoundCharacterUI, switchPuzzle, updateThumbnailUI, } from "./ui/ui.js";

export function initWebSocket(playerId) {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    ws.send(JSON.stringify({ type: "join", playerId }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // console.log("WebSocket message:", data);
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
    updateThumbnailUI(playerWhoFoundId, puzzleIdx);
    switchPuzzle(PUZZLES, foundArr, puzzleIdx);
    if (playerWhoFoundId === PLAYER_ID ) cancelNegativePowerUps(playerWhoFoundId, playerStats, ws);
  },

  gameOver: () => {
    setGameOver();
    return alert("Game over");
  },

  opponentQuit: ({ gameId }) => {
    console.log(`Opponent quit game ${gameId} is over`);
    showLobby();
  },

  activeEffectUpdate: ({playerStats}) => {

      Object.keys(playerStats).forEach(key => {
          playerStats[key].activeEffect.forEach(effect => {
              // console.log(`${key} has power-up ${effect.name} currently running for ${effect.duration}`)
          })
      })
  },

  powerUpFound: ({ puzzleIdx, character, playerWhoFoundId, playerStats }, ws,) => {
        
    updateFoundCharacterUI(puzzleIdx, character);

    const positiveEffectsTarget = playerWhoFoundId;
    const negativeEffectTarget = Object.keys(playerStats).filter( (id) => id != playerWhoFoundId,)[0];

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
        applyPowerUp( powerUp, positiveEffectsTarget, playerStats, ws, puzzleIdx,);
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
    let effectAlreadyActive = existingEffectIdx !== -1 ? true : false
    const { duration, cleanUpFn, name} = powerUp
   // console.log("CONSOLE: ", powerUp, "\n", activeEffects)

    if (effectAlreadyActive) {
      // Power--up already active extend duration.
      const existingEffect = activeEffects[existingEffectIdx];
      const elapsed = Date.now() - existingEffect.startTime;
      const remaining = existingEffect.duration - elapsed;
      const newDuration = Math.max(0, remaining) + powerUp.duration;

      clearTimeout(existingEffect.timeoutId);
      existingEffect.duration = newDuration;
      existingEffect.startTime = Date.now();

      existingEffect.timeoutId = setEffectTimeout(name, newDuration, cleanUpFn, activeEffects, playerStats, ws)
     // console.log(`Extended ${name} duration to ${newDuration}ms`);
    } else {
      // power-up not active
      powerUp.fn(idx);
      const effect = {
        ...powerUp,
        startTime: Date.now(),
        timeoutId: setEffectTimeout(name, duration, cleanUpFn, activeEffects, playerStats, ws),
      };

        activeEffects.push(effect)
      //  console.log(`Applied ${name} for ${duration}ms`)
    }
      wsSend(ws, { type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID })
  }
}

function cancelNegativePowerUps(playerId, playerStats, ws) {
  const negativeEffectsArr = playerStats[playerId].activeEffect.filter(
    (effect) => effect.type === "negative",
  );

  if (negativeEffectsArr.length === 0) return;

  negativeEffectsArr.forEach((activeEffect) => {
    const idx = powerUpsObj[activeEffect.char].findIndex(
      (powerUp) => powerUp.name === activeEffect.name,
    );
      // call clean-up function for negative effect
      clearTimeout(activeEffect.timeoutId)
    powerUpsObj[activeEffect.char][idx].cleanUpFn();
      const effectIdx = playerStats[playerId].activeEffect.findIndex(
          (item) => item.name === activeEffect.name,
      );
      // remove negative effect from active effect array
      playerStats[playerId].activeEffect.splice(effectIdx, 1);
  });

  wsSend(ws, { type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID })
}

const wsSend = (ws, jsonData) => ws.send(JSON.stringify(jsonData))

function setEffectTimeout(name, duration, cleanUpFn, activeEffects, playerStats, ws) {

    return setTimeout(() => {
        cleanUpFn();
        const effectIdx = activeEffects.findIndex(item => item.name === name);
        if (effectIdx !== -1) activeEffects.splice(effectIdx, 1);
        wsSend(ws,{ type: "activeEffectUpdate", playerStats, playerId: PLAYER_ID, })
    }, duration)

}
