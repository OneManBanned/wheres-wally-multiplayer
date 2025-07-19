import { DOM } from "../main.js";

export const animationState = (() => {
  let isAnimatingFill = false;
  return {
    set: (bool) => (isAnimatingFill = bool),
    get: () => isAnimatingFill,
  };
})();

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
  const magnifier = document.querySelector("#magnifier");
  const magRect = magnifier.getBoundingClientRect();
  const animationWidth = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--lens-size"),
  );
  const offset = (magRect.width - animationWidth) / 2;
  const startX = magRect.left - gameRect.left + offset;
  const startY = magRect.top - gameRect.top + offset;

  const thumbRect = DOM.allPuzzleContainers[idx].getBoundingClientRect();
  const thumbCenterX = thumbRect.left + thumbRect.width / 2 - gameRect.left;
  const thumbCenterY = thumbRect.top + thumbRect.height / 2 - gameRect.top;
  const endX = thumbCenterX - animationWidth / 2;
  const endY = thumbCenterY - animationWidth / 2;

  document.documentElement.style.setProperty(
    "--wally-start-x",
    `${startX - 2}px`,
  );
  document.documentElement.style.setProperty(
    "--wally-start-y",
    `${startY - 2}px`,
  );
  document.documentElement.style.setProperty("--wally-end-x", `${endX}px`);
  document.documentElement.style.setProperty("--wally-end-y", `${endY}px`);

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
      particleCount: 100,
      spread: 50,
      angle: angle,
      origin: origin,
      colors: ["#000000", "#FFC107", "#FFFFFF"],
      scalar: 0.8,
    });
  };

  const confettiInterval = setInterval(fireConfetti, 1500);

  return () => {
    clearInterval(confettiInterval);
    setTimeout(() => {
      confettiInstance.reset();
        canvas.remove();
    }, 1000);
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

// Status-bar animations //

class effectNameAnimationQueue {
  #animationQueues = new Map();
  #isAnimating = new Map();

  getQueue(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("Invalid container: must be an HTMLElement");
    }
    if (!this.#animationQueues.has(container)) {
      this.#animationQueues.set(container, []);
      this.#isAnimating.set(container, false);
    }

    return this.#animationQueues.get(container);
  }

  clearQueue(container) {
    this.#animationQueues.set(container, []);
  }

  processQueue(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("Invalid container: must be an HTMLElement");
    }
    const queue = this.getQueue(container);
    if (queue.length === 0 || this.#isAnimating.get(container)) {
      return;
    }

    this.#isAnimating.set(container, true);
    const { effect, isPlayer, activeEffects } = queue.shift();
    const { name, char } = effect;
    flashEffectName(container, activeEffects, name, isPlayer, char, () => {
      this.#isAnimating.set(container, false);
      this.processQueue(container);
    });
  }
}

export const animationQueue = new effectNameAnimationQueue();

function formatEffectName(name) {
  return name
    .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
    .trim() // Remove leading space if any
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

// Helper to flash the effect name with per-letter animation
function flashEffectName(
  container,
  activeEffects,
  effectName,
  isPlayer,
  character,
  onComplete,
) {
  const flash = document.createElement("div");
  flash.className = `effect-flash ${isPlayer ? "player" : ""} ${character || ""}`; // Add character class (e.g., odlaw)
  container.style.position = "relative";
  container.appendChild(flash);

  // Format the effect name (e.g., lensBlur → Lens Blur)
  const formattedName = formatEffectName(effectName);

  // Split formatted name into letters
  const letters = formattedName.split("");
  letters.forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = "effect-letter";
    if (letter === " ") {
      span.classList.add("space"); // Mark space for CSS
    }
    span.textContent = letter;
    span.style.animationDelay = `${index * 0.1}s`; // 100ms delay for initial bounce
    flash.appendChild(span);
    return span;
  });

  // Calculate timing based on number of letters
  const bounceTime = 1200 + (letters.length - 1) * 100; // 1200ms base + 100ms per extra letter

  // Slide and fade the entire word after bounce + pause (0.5s)
  setTimeout(() => {
    flash.classList.add("slide-out");
  }, bounceTime + 500); // Bounce + 500ms pause

  // Clean up and show icons
  setTimeout(() => {
    flash.remove();
    container.style.position = "";
    container.innerHTML = "";
    activeEffects.forEach((e) => {
      container.appendChild(createEffectIcon(e));
    });
    if (activeEffects.length > 0) {
      startBadgeTimer(); // Start animation after flash
    }
    if (onComplete) onComplete();
  }, bounceTime + 800); // Bounce + 500ms pause + 300ms slide
}

// Track badge timers globally
let timerInterval = null;

export function startBadgeTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    [DOM.playerEffects, DOM.opponentEffects].forEach((container) => {
      const badges = container.querySelectorAll(".effect-badge");
      badges.forEach((badge) => {
        const startTime = parseInt(badge.dataset.startTime, 10);
        const duration = parseInt(badge.dataset.duration, 10);

        const remainingMs = Math.max(0, duration - (Date.now() - startTime));
        const circle = badge.querySelector(".badge-border");
        const circumference = 2 * Math.PI * 8.5;
        const progress = remainingMs / duration;
        circle.style.strokeDashoffset = circumference * (1 - progress);
      });
    });
  }, 100);
}

export function stopBadgeTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function createEffectIcon(effect) {
  const { name: effectName, duration, startTime, type } = effect;
  if (isNaN(startTime) || isNaN(duration)) {
    console.error(`Invalid timer data in createEffectIcon for ${effectName}:`, {
      startTime,
      duration,
    });
    startTime = Date.now();
    duration = 3000;
  }

  const badge = document.createElement("div");
  badge.className = `effect-badge ${type.toLowerCase()}`;
  badge.dataset.effectName = effectName;
  badge.dataset.startTime = startTime;
  badge.dataset.duration = duration;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("cx", "9");
  circle.setAttribute("cy", "9");
  circle.setAttribute("r", "8.5");
  circle.classList.add("badge-border");
  circle.setAttribute("fill", "none");
  const circumference = 2 * Math.PI * 8.5;
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = "0";
  svg.appendChild(circle);
  badge.appendChild(svg);

  const letter = document.createElement("span");
  letter.className = "badge-letter";
  letter.textContent = effectName[0].toUpperCase();
  badge.appendChild(letter);

  return badge;
}
