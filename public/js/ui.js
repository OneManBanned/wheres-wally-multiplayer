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

export function showLobby() {
    document.querySelector("#lobby-view").style.display = "block";
    document.querySelector("#game-view").style.display = "none";
}

export function showGame() {
    document.querySelector("#lobby-view").style.display = "none";
    document.querySelector("#game-view").style.display = "grid";
}

export const updateTimerDisplay = (str, timer) => (timer.textContent = str);

export function setupThumbnailListeners(thumbnails, mainPuzzle) {
    thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            mainPuzzle.src = thumb.src;
        });
    });
}

export function updateSolvedThumbnails() {
    allPuzzleContainers.forEach((puzzle, i) => {
        if (foundArr[i]) {
            puzzle.style.opacity = 0.5;
            puzzle.style.pointerEvents = "none";
        } else {
            puzzle.style.opacity = 1;
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
    console.log(currentPuzzleIdx, idx);
    if (currentPuzzleIdx !== idx) return;

    const unsolvedIdx = foundArr.indexOf(false);
    if (unsolvedIdx !== -1) mainPuzzle.src = puzzles[unsolvedIdx];
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

    const glassEffect = document.createElement("div");
    glassEffect.className = "glass-effect";
    magnifier.appendChild(glassEffect);

    const zoomLevel = 2;
    let lensSize = 140;

    magnifier.style.height = `${lensSize}px`;
    magnifier.style.width = `${lensSize}px`;

    image.addEventListener("mouseover", () => {
        magnifier.style.display = "flex";
    });

    image.addEventListener("mousemove", (e) => {
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

        magnifier.style.backgroundImage = `url(${image.src})`;
        isFlipped
            ? (magnifier.style.transform = "rotate(180deg)")
            : (magnifier.style.transform = "rotate(0deg)");

        magnifier.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
        magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
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
