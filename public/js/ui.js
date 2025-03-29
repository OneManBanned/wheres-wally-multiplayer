import { foundArr, powerUpsArr } from "./game.js";
import {
    allHeadshotContainers,
    allPuzzleContainers,
    headshots,
    opponentScore,
    playerScore,
} from "./main.js";
import {
    getCharacterFromImagePath,
    getPhotoRect,
    getPathFromURL,
    positionInPercent,
} from "./utils.js";


let isAnimatingFill = false;

export function showLobby(lobby, game) {
    lobby.style.display = "block";
    game.style.display = "none";
  allPuzzleContainers.forEach((container) => {
        const extras = container.querySelectorAll(".wally-found-bg, .wally-headshot");
        extras.forEach((el) => el.remove());
    });
}

export function showGame(lobby, game) {
    lobby.style.display = "none";
    game.style.display = "grid";
}

export const updateTimerDisplay = (str, timer) => (timer.textContent = str);

export function setupThumbnailListeners(thumbnails, mainPuzzle) {
    thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            mainPuzzle.style.opacity = "0";

            setTimeout(() => {
                mainPuzzle.src = thumb.src;

                mainPuzzle.onload = () => {
                    mainPuzzle.style.opacity = "1";
                    mainPuzzle.onload = null; // Clean up
                };
                kkkkk;
            }, 300);
        });
    });
}

export function updateSolvedThumbnails(id) {
    allPuzzleContainers.forEach((puzzle, i) => {
        if (foundArr[i]) {
            puzzle.style.pointerEvents = "none";
            console.log(id, "\n" ,playerId, "\n", window.playerId)
            if (id != playerId) {
                console.log("your opponent found wally on map", i)
                puzzle.style.opacity = 0.2
            }
        } else {
            puzzle.style.pointerEvents = "auto";
        }
    });
}

export function updateScores(playerStats, playerId) {
    const {
        [playerId]: { wallysFound: playersWallys },
    } = playerStats;
    playerScore.innerText = playersWallys;
    const opponentId = Object.keys(playerStats).find((id) => id !== playerId);
    const { wallysFound: opponentsWallys } = playerStats[opponentId];

    opponentScore.innerText = opponentsWallys;
}

export function updateFoundCharacters(idx, character) {
    const container = allHeadshotContainers[idx];
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

export function syncFoundCharacters() {
    allHeadshotContainers.forEach((container, idx) => {
        headshots.forEach((img) => {
            const char = getCharacterFromImagePath(img.src);
            const isFound = powerUpsArr[idx][char];
            const overlay = img.nextElementSibling;
            img.style.opacity = isFound ? "0.5" : "1";
            overlay.style.display = isFound ? "block" : "none";
        });
    });
}

function extractImagePath(url) {
    const pathStart = url.indexOf("/images/");
    if (pathStart === -1) return null;
    return url.substring(pathStart);
}

export function switchToUnsolvedPuzzle(mainPuzzle, puzzles, foundArr, idx) {
    const mainPuzzleSrc = extractImagePath(mainPuzzle.src);
    const currentPuzzleIdx = puzzles.indexOf(mainPuzzleSrc);
    if (currentPuzzleIdx !== idx) return;

    const unsolvedIdx = foundArr.indexOf(false);

    if (unsolvedIdx !== -1) {
        mainPuzzle.style.opacity = "0";

        setTimeout(() => {
            mainPuzzle.src = puzzles[unsolvedIdx];

            mainPuzzle.onload = () => {
                mainPuzzle.style.opacity = "1";
                mainPuzzle.onload = null;
            };
        }, 300);
    }
}

export function targetingCoordinates(position, checkCharacter, rect, img) {
    const { xPercent, yPercent } = positionInPercent(position, rect);
    const pathname = getPathFromURL(img.src);

    const index = puzzles.indexOf(pathname);
    checkCharacter(index, xPercent, yPercent);
}

export function setupPuzzle(mainPuzzle, checkCharacter) {
    mainPuzzle.addEventListener("click", (e) => {
        const rect = getPhotoRect(mainPuzzle);
        const isFlipped = mainPuzzle.dataset.flipped === "true";

        const x = isFlipped ? -(e.clientX - rect.right) : e.clientX - rect.left;
        const y = isFlipped ? -(e.clientY - rect.bottom) : e.clientY - rect.top;

        targetingCoordinates({ x, y }, checkCharacter, rect, mainPuzzle);
    });

    setupMagnifier(mainPuzzle);
}

export function setupMagnifier(image) {
    const magnifier = document.createElement("div");
    magnifier.id = "magnifier";
    document.querySelector("#puzzle-container").appendChild(magnifier);

    const lens = document.createElement("div");
    lens.className = "lens-content";
    magnifier.appendChild(lens);

    const glassEffect = document.createElement("div");
    glassEffect.className = "glass-effect";
    magnifier.appendChild(glassEffect);

    const zoomLevel = 2;
  const lensSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--lens-size"), 10);

    console.log("magnifyingGlasslens: ", lensSize)

    magnifier.style.height = `${lensSize}px`;
    magnifier.style.width = `${lensSize}px`;

    image.addEventListener("mouseover", () => {
        magnifier.style.display = "flex";
    });

    image.addEventListener("mousemove", (e) => {
        if (isAnimatingFill) return;
        let rect = getPhotoRect(image);
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


export function setupConfetti(puzzleContainer, origin, angle) {
    const canvas = document.createElement("canvas");
    canvas.width = puzzleContainer.offsetWidth;
    canvas.height = puzzleContainer.offsetHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";
    canvas.style.pointerEvents = "none";
    puzzleContainer.appendChild(canvas);

    const confettiInstance = confetti.create(canvas, { resize: true });

    const fireConfetti = () => {
        confettiInstance({
            particleCount: 500,
            spread: 50,
            angle: angle,
            origin: origin,
            colors: ["#000000", "#FFC107", "#FFFFFF"],
            scalar: 0.9,
        });
    };

    const confettiInterval = setInterval(fireConfetti, 1000);

    return () => {
        clearInterval(confettiInterval);
        setTimeout(() => {
            confettiInstance.reset();
        }, 3000);
    };
}

export function showWallyFoundFeedback(lensContent, thumbnail, game) {

  const background = document.createElement("div");
  background.className = "wally-found-bg";
  const whiteCircle = document.createElement("div"); 
  whiteCircle.className = "wally-white-circle";
  const headshot = document.createElement("img");

  headshot.src = "/images/wally-head.png";
  headshot.className = "wally-headshot";
  headshot.alt = "Wally Found";

  game.appendChild(headshot);
  game.appendChild(background);
  game.appendChild(whiteCircle);

  const gameRect = game.getBoundingClientRect();
  const magnifier = lensContent.parentElement;
  const magRect = magnifier.getBoundingClientRect();
  const startX = magRect.left + magRect.width / 2 - gameRect.left;
  const startY = magRect.top + magRect.height / 2 - gameRect.top; 
  const thumbRect = thumbnail.getBoundingClientRect();
  const endX = thumbRect.left + thumbRect.width / 2 - gameRect.left;
  const endY = thumbRect.top + thumbRect.height / 2 - gameRect.top; 


  const lensSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--lens-size"), 10);
  const offset = lensSize / 2;

  document.documentElement.style.setProperty("--wally-start-x", `${startX - offset}px`);
  document.documentElement.style.setProperty("--wally-start-y", `${startY - offset}px`);
  document.documentElement.style.setProperty("--wally-end-x", `${endX - offset}px`);
  document.documentElement.style.setProperty("--wally-end-y", `${endY - offset}px`);
  document.documentElement.style.setProperty("--thumb-width", `${thumbRect.width}px`);
  document.documentElement.style.setProperty("--thumb-height", `${thumbRect.height}px`);

  isAnimatingFill = true;
  background.classList.add("fill");
  whiteCircle.classList.add("fill"); 
  headshot.classList.add("fill");

    game.style.position = "relative";
    game.style.zIndex = `1000`; // Above all prior thumbnails

  setTimeout(() => {

    background.classList.remove("fill");
    whiteCircle.classList.remove("fill"); 
    headshot.classList.remove("fill");

    isAnimatingFill = false;

    background.classList.add("traverse");
    whiteCircle.classList.add("traverse"); 
    headshot.classList.add("traverse");

  }, 1000);

  setTimeout(() => {

      thumbnail.style.position = "relative";

      thumbnail.appendChild(background);
      thumbnail.appendChild(headshot);
      thumbnail.appendChild(whiteCircle);

    game.style.zIndex = "";

      background.classList.add("spread")
      whiteCircle.classList.add("spread")
      headshot.classList.add("spread")

  }, 2000);
}
