import { playerFoundWallyFeedback, fadePuzzle, opponentFoundWallyFeedback, showMissFeedback, animationQueue, createEffectIcon, stopBadgeTimer, startBadgeTimer, } from "./animations.js";
import { DOM } from "../main.js";
import { setupMagnifier } from "./magnifier.js";
import { extractImgPath, getCharFromImgPath, getOpponentId, getPathFromURL, positionInPercent, } from "../utils/utils.js";
import { PLAYER_ID, PUZZLES } from "../constants.js";
import { getPlayerEffectsFromStats } from "../powerups/powerups.js";

export function showGame() {
    DOM.lobbyView.style.display = "none";
    DOM.gameView.style.display = "grid";
}

export function showLobby() {
    DOM.lobbyView.style.display = "block";
    DOM.gameView.style.display = "none";
    resetThumbnailsUI();
    resetFoundCharactersUI();
    animationQueue.clearQueue(DOM.playerEffects)
    animationQueue.clearQueue(DOM.opponentEffects)
}

export function setupThumbnailListeners() {
    DOM.allPuzzles.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            fadePuzzle(thumb.src);
        });
    });
}

function resetThumbnailsUI() {
    DOM.allPuzzleContainers.forEach((c) => {
        c.style.opacity = 1;
        c.style.pointerEvents = "auto";
        const extras = c.querySelectorAll(
            ".wally-found-bg, .wally-headshot, .wally-white-circle",
        );
        extras.forEach((el) => el.remove());
    });
}

export function updateThumbnailUI(id, idx) {
    DOM.allPuzzleContainers[idx].style.pointerEvents = "none";
    id === PLAYER_ID
        ? playerFoundWallyFeedback(idx)
        : opponentFoundWallyFeedback(idx);
}

export function resetFoundCharactersUI() {
    DOM.headshots.forEach((img) => {
        const overlay = img.nextElementSibling;
        img.style.opacity = "1";
        overlay.style.display = "none";
    });
}

export function updateFoundCharacterUI(idx, character) {
    const container = DOM.allHeadshotContainers[idx];
    if (!container) return;

    const headshots = container.querySelectorAll(".headshot");
    headshots.forEach((img) => {
        const char = getCharFromImgPath(img.src);
        if (char === character) {
            const overlay = img.nextElementSibling;
            img.style.opacity = 0.5;
            if (overlay) overlay.style.display = "block";
        }
    });
}

export const updateTimerDisplay = (str) => (DOM.timerDisplay.textContent = str);

export function updateScores(playerStats, playerId) {
    const opponentId = getOpponentId(playerStats, playerId);
    const { wallysFound: playersWallys } = playerStats[playerId];
    const { wallysFound: opponentsWallys } = playerStats[opponentId];

    DOM.playerScore.innerText = playersWallys;
    DOM.opponentScore.innerText = opponentsWallys;
}

export function switchPuzzle(puzzles, foundArr, idx) {
    const mainPuzzleSrc = extractImgPath(DOM.mainPuzzle.src);
    const currentPuzzleIdx = puzzles.indexOf(mainPuzzleSrc);
    if (currentPuzzleIdx !== idx) return;

    const unsolvedIdx = foundArr.indexOf(false);

    if (unsolvedIdx !== -1) fadePuzzle(puzzles[unsolvedIdx]);

}

export async function targetingCoordinates(position, checkCharacter, rect) {
    const { xPercent, yPercent } = positionInPercent(position, rect);
    const pathname = getPathFromURL(DOM.mainPuzzle.src);

    const index = PUZZLES.indexOf(pathname);
    return await checkCharacter(index, xPercent, yPercent);
}

const guessProcessingState = (() => {
    let isProcessingGuess = false;
    return {
        set: (bool) => (isProcessingGuess = bool),
        get: () => isProcessingGuess,
    };
})();

export function setupPuzzle(checkCharacter) {
    DOM.mainPuzzle.addEventListener("click", async (e) => {
        if (guessProcessingState.get()) return;
        guessProcessingState.set(true);

        const rect = DOM.mainPuzzle.getBoundingClientRect();
        const isFlipped = DOM.mainPuzzle.dataset.flipped === "true";

        const x = isFlipped ? -(e.clientX - rect.right) : e.clientX - rect.left;
        const y = isFlipped ? -(e.clientY - rect.bottom) : e.clientY - rect.top;

        try {
            const charFound = await targetingCoordinates({ x, y }, checkCharacter, rect);
            if (charFound === false) showMissFeedback();
        } catch (err) {
            console.error("Error processing guess: ", err);
        } finally {
            guessProcessingState.set(false);
        }
    });

    setupMagnifier();
}

export function updateActiveEffectsUI(playerStats, player, effect = null) {
  const activeEffects = getPlayerEffectsFromStats(playerStats, player);
  const opponentId = getOpponentId(playerStats, player)
  const opponentsActiveEffects = getPlayerEffectsFromStats(playerStats, opponentId)
  const isPlayer = player === PLAYER_ID;
  const container = isPlayer ? DOM.playerEffects : DOM.opponentEffects;

  if (effect) {
    if (effect.isExtension) {
      container.innerHTML = "";
      activeEffects.forEach(e => {
        container.appendChild(createEffectIcon(e));
      });
      startBadgeTimer();
    } else {
      const queue = animationQueue.getQueue(container);
      queue.push({ effect, activeEffects, isPlayer });
      animationQueue.processQueue(container);
    }
  } else {
    container.innerHTML = "";
    activeEffects.forEach((e) => {
      container.appendChild(createEffectIcon(e));
    });
    if (activeEffects.length > 0 || opponentsActiveEffects.length > 0) {
      startBadgeTimer();
    } else {
      stopBadgeTimer();
    }
  }
}

export function showGameOverScreen(result, reason) {
const gameOver = document.getElementById("game-over");
  const endGameStatus = document.querySelector(".endGameStatus");
  gameOver.classList.remove("hidden");
    endGameStatus.textContent = `${result}`;
    endGameStatus.innresult.split('').map(l => `${l}`)

const home = document.querySelector(".home")
    home.addEventListener("click", () => {
        window.location.href = "/"
    })
}
