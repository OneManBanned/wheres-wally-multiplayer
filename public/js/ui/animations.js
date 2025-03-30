import { DOM } from "../main.js";
import { setIsAnimatingFill } from "./ui.js";

export function showWallyFoundFeedback(idx) {

  const background = document.createElement("div");
  background.className = "wally-found-bg";

  const whiteCircle = document.createElement("div"); 
  whiteCircle.className = "wally-white-circle";

  const headshot = document.createElement("img");
  headshot.className = "wally-headshot";
  headshot.src = "/images/wally-head.png";
  headshot.alt = "Wally Found";

  DOM.gameView.appendChild(headshot);
  DOM.gameView.appendChild(background);
  DOM.gameView.appendChild(whiteCircle);

  const gameRect = DOM.gameView.getBoundingClientRect();
  const magnifier = document.querySelector(".lens-content");
  const magRect = magnifier.getBoundingClientRect();
  const startX = magRect.left + magRect.width / 2 - gameRect.left;
  const startY = magRect.top + magRect.height / 2 - gameRect.top; 
  const thumbRect = DOM.allPuzzleContainers[idx].getBoundingClientRect();
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

    setIsAnimatingFill(true)
  background.classList.add("fill");
  whiteCircle.classList.add("fill"); 
  headshot.classList.add("fill");

    DOM.gameView.style.position = "relative";
    DOM.gameView.style.zIndex = `1000`; // Above all prior thumbnails

  setTimeout(() => {

    background.classList.remove("fill");
    whiteCircle.classList.remove("fill"); 
    headshot.classList.remove("fill");

setIsAnimatingFill(false)

    background.classList.add("traverse");
    whiteCircle.classList.add("traverse"); 
    headshot.classList.add("traverse");

  }, 1000);

  setTimeout(() => {

      DOM.allPuzzleContainers[idx].style.position = "relative";

      DOM.allPuzzleContainers[idx].appendChild(background);
      DOM.allPuzzleContainers[idx].appendChild(headshot);
      DOM.allPuzzleContainers[idx].appendChild(whiteCircle);

      DOM.gameView.style.zIndex = "";

      background.classList.add("spread")
      whiteCircle.classList.add("spread")
      headshot.classList.add("spread")

  }, 2000);
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

export function showMissFeedback() {

  DOM.mainPuzzleContainer.classList.add("shake");
  setTimeout(() => {
    DOM.mainPuzzleContainer.classList.remove("shake");
  }, 500); 

}
