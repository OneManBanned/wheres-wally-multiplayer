import { showWallyFoundFeedback } from "./animations.js";
import { DOM } from "../main.js";
import { setupMagnifier } from "./magnifier.js";
import { extractImagePath, getCharacterFromImagePath, getPathFromURL, positionInPercent, } from "../utils.js";

export let isAnimatingFill = false;
export const setIsAnimatingFill = (bool) => (isAnimatingFill = bool);

export function showGame() {
  DOM.lobbyView.style.display = "none";
  DOM.gameView.style.display = "grid";
}

export function showLobby() {
  DOM.lobbyView.style.display = "block";
  DOM.gameView.style.display = "none";
  resetThumbnailsUI();
  resetFoundCharactersUI();
}

export function setupThumbnailListeners() {
  DOM.allPuzzles.forEach((thumb) => {
    thumb.addEventListener("click", () => DOM.mainPuzzle.src = thumb.src);
})
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
  id === playerId
    ? showWallyFoundFeedback(idx)
    : (DOM.allPuzzleContainers[idx].style.opacity = 0.2);
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
    const char = getCharacterFromImagePath(img.src);
    if (char === character) {
      const overlay = img.nextElementSibling;
      img.style.opacity = 0.5;
      if (overlay) overlay.style.display = "block";
    }
  });
}


export const updateTimerDisplay = (str) => (DOM.timerDisplay.textContent = str);

export function updateScores(playerStats, playerId) {
  const {
    [playerId]: { wallysFound: playersWallys },
  } = playerStats;
  DOM.playerScore.innerText = playersWallys;
  const opponentId = Object.keys(playerStats).find((id) => id !== playerId);
  const { wallysFound: opponentsWallys } = playerStats[opponentId];

  DOM.opponentScore.innerText = opponentsWallys;
}

export function switchPuzzle(puzzles, foundArr, idx) {
  const mainPuzzleSrc = extractImagePath(DOM.mainPuzzle.src);
  const currentPuzzleIdx = puzzles.indexOf(mainPuzzleSrc);
  if (currentPuzzleIdx !== idx) return;

  const unsolvedIdx = foundArr.indexOf(false);

  if (unsolvedIdx !== -1) {
    DOM.mainPuzzle.style.opacity = "0";

    setTimeout(() => {
      DOM.mainPuzzle.src = puzzles[unsolvedIdx];

      DOM.mainPuzzle.onload = () => {
        DOM.mainPuzzle.style.opacity = "1";
        DOM.mainPuzzle.onload = null;
      };
    }, 300);
  }
}

export function targetingCoordinates(position, checkCharacter, rect) {
  const { xPercent, yPercent } = positionInPercent(position, rect);
  const pathname = getPathFromURL(DOM.mainPuzzle.src);

  const index = puzzles.indexOf(pathname);
  checkCharacter(index, xPercent, yPercent);
}

export function setupPuzzle(checkCharacter) {
  DOM.mainPuzzle.addEventListener("click", (e) => {
    const rect = DOM.mainPuzzle.getBoundingClientRect();
    const isFlipped = DOM.mainPuzzle.dataset.flipped === "true";

    const x = isFlipped ? -(e.clientX - rect.right) : e.clientX - rect.left;
    const y = isFlipped ? -(e.clientY - rect.bottom) : e.clientY - rect.top;

    targetingCoordinates({ x, y }, checkCharacter, rect);
  });

  setupMagnifier();
}
/*
export function setupMagnifier(image = DOM.mainPuzzle) {
  const magnifier = document.createElement("div");
  magnifier.id = "magnifier";
  DOM.mainPuzzleContainer.appendChild(magnifier);

  const lens = document.createElement("div");
  lens.className = "lens-content";
  magnifier.appendChild(lens);

  const glassEffect = document.createElement("div");
  glassEffect.className = "glass-effect";
  magnifier.appendChild(glassEffect);

  const zoomLevel = 2;
  const lensSize = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--lens-size"),
    10,
  );

  magnifier.style.height = `${lensSize}px`;
  magnifier.style.width = `${lensSize}px`;

  image.addEventListener("mouseover", () => {
    magnifier.style.display = "flex";
  });

  image.addEventListener("mousemove", (e) => {
    if (isAnimatingFill) return;
    let rect = image.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    const isFlipped = image.dataset.flipped === "true";

    // Position lens over mouse
    magnifier.style.left = `${x - lensSize / 2}px`;
    magnifier.style.top = `${y - lensSize / 2}px`;

    // Zoomed background: offset and scale
    let bgX = isFlipped
      ? -((rect.width - x) * zoomLevel - lensSize / 2) // Reflect the offset
      : -(x * zoomLevel - lensSize / 2);

    let bgY = isFlipped
      ? -((rect.height - y) * zoomLevel - lensSize / 2) // Reflect the offset
      : -(y * zoomLevel - lensSize / 2);

    lens.style.backgroundImage = `url(${image.src})`;

    lens.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  });

  image.addEventListener("mousedown", () => {
    magnifier.classList.add("targeting"); // Switch to reticle
  });

  image.addEventListener("mouseup", () => {
    magnifier.classList.remove("targeting"); // Back to dot
  });

  image.addEventListener("mouseout", () => {
    magnifier.style.display = "none";
    magnifier.classList.remove("targeting"); // Reset on exit
  });
}
*/
