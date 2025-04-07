import { DOM } from "../main.js";

export const animationState = (() => {
    let isAnimatingFill = false;
    return {
        set: (bool) => isAnimatingFill = bool,
        get: () => isAnimatingFill,
    }
})()

export function playerFoundWallyFeedback(idx) {

  const bg = document.createElement("div");
  bg.className = "wally-found-bg";

  const circle = document.createElement("div");
  circle.className = "wally-white-circle";

  const headshot = document.createElement("img");
  headshot.className = "wally-headshot";
  headshot.src = "/images/wally-head.png";
  headshot.alt = "Wally Found";

  DOM.gameView.append(bg, circle, headshot);

  const gameRect = DOM.gameView.getBoundingClientRect();
  const magnifier = document.querySelector(".lens-content");
  const magRect = magnifier.getBoundingClientRect();
  const startX = magRect.left + magRect.width / 2 - gameRect.left;
  const startY = magRect.top + magRect.height / 2 - gameRect.top;

  const thumbRect = DOM.allPuzzleContainers[idx].getBoundingClientRect();
  const endX = thumbRect.left + thumbRect.width / 2 - gameRect.left;
  const endY = thumbRect.top + thumbRect.height / 2 - gameRect.top;

  const lensSize = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--lens-size"),
    10,
  );
  const offset = lensSize / 2;

  document.documentElement.style.setProperty( "--wally-start-x", `${startX - offset - 2}px`,);
  document.documentElement.style.setProperty( "--wally-start-y", `${startY - offset - 2}px`,);
  document.documentElement.style.setProperty( "--wally-end-x", `${endX - offset}px`,);
  document.documentElement.style.setProperty( "--wally-end-y", `${endY - offset}px`,);

  animationState.set(true);
  bg.classList.add("fill");
  circle.classList.add("fill");
  headshot.classList.add("fill");

  DOM.gameView.style.position = "relative";
  DOM.gameView.style.zIndex = `1000`; // Above all prior thumbnails

  setTimeout(() => {
    bg.classList.remove("fill");
    circle.classList.remove("fill");
    headshot.classList.remove("fill");

    animationState.set(false);

    bg.classList.add("traverse");
    circle.classList.add("traverse");
    headshot.classList.add("traverse");
  }, 1000);

  setTimeout(() => {
    DOM.allPuzzleContainers[idx].style.position = "relative";

    DOM.allPuzzleContainers[idx].appendChild(bg);
    DOM.allPuzzleContainers[idx].appendChild(headshot);
    DOM.allPuzzleContainers[idx].appendChild(circle);

    DOM.gameView.style.zIndex = "";

    applySpreadAnimation(DOM.gameView, bg, circle, headshot, thumbRect);
  }, 2000);
}

export function opponentFoundWallyFeedback(idx) {
    
  // Create elements
  const bg = document.createElement("div");
  bg.classList.add("wally-found-bg");
  bg.classList.add("wally-found-bg-opponent");

  const circle = document.createElement("div");
  circle.classList.add("wally-white-circle");

  const headshot = document.createElement("img");
  headshot.classList.add("wally-headshot");
  headshot.src = "/images/wally-head.png";

  // Position them (start centered)

  const thumbRect = DOM.allPuzzleContainers[idx].getBoundingClientRect();
  const startX = thumbRect.width / 2;
  const startY = thumbRect.height / 2;

  document.documentElement.style.setProperty("--wally-start-x", `${startX}px`);
  document.documentElement.style.setProperty("--wally-start-y", `${startY}px`);

  DOM.allPuzzleContainers[idx].append(bg, circle, headshot);

  applySpreadAnimation(DOM.gameView, bg, circle, headshot, thumbRect);
}

function applySpreadAnimation(container, bg, circle, headshot, rect) {
  container.style.setProperty("--thumb-width", `${rect.width}px`);
  container.style.setProperty("--thumb-height", `${rect.height}px`);
  bg.classList.add("spread");
  circle.classList.add("spread");
  headshot.classList.add("spread");
}

export function setupConfetti(origin, angle) {
  const canvas = document.createElement("canvas");
  canvas.width = DOM.mainPuzzleContainer.offsetWidth;
  canvas.height = DOM.mainPuzzleContainer.offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "1";
  canvas.style.pointerEvents = "none";
  DOM.mainPuzzleContainer.appendChild(canvas);

  const confettiInstance = confetti.create(canvas, { resize: true });

  const fireConfetti = () => {
    confettiInstance({
      particleCount: 250,
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

export function showMissFeedback() {
  DOM.mainPuzzleContainer.classList.add("shake");
  setTimeout(() => {
    DOM.mainPuzzleContainer.classList.remove("shake");
  }, 500);
}

export function fadePuzzle(newSrc) {
  DOM.mainPuzzle.style.opacity = "0";

  const magnifier = document.querySelector(".lens-content");
  magnifier.classList.add("fade-out");

  setTimeout(() => {
    DOM.mainPuzzle.src = newSrc;

    DOM.mainPuzzle.onload = () => {
      DOM.mainPuzzle.style.opacity = "1";
      magnifier.classList.remove("fade-out");
      DOM.mainPuzzle.onload = null;
    };
  }, 300);
}
