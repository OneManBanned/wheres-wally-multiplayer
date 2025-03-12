let gameActive, timeLeft;
export const foundArr = new Array(puzzles.length).fill(false);

export function startGame() {
  const timerDisplay = document.querySelector("#timer");
  timeLeft = parseFloat(timerDisplay.dataset.timeLeft);
  gameActive = true;

  setInterval(() => {
    if (gameActive && timeLeft > 0) {
      timeLeft -= 1;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60)
        .toString()
        .padStart(2, "0");
      timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
    } else {
      gameActive = false;
      timerDisplay.textContent = "Time's up!";
    }
  }, 1000);
}

export function checkCharacter(index, x, y, switchInPlayPhoto) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, x, y }),
  })
    .then((res) => res.json())
    .then((data) => {
      const { success, gameOver } = data;
      if (gameOver) {
        gameActive = false;
        return alert("Game over");
      }
      if (success) {
        foundArr[index] = true;
        for (let i = 0; i < foundArr.length; i++) {
          if (foundArr[i] === false) {
            document.querySelector("#currentPuzzle").src = puzzles[i];
            switchInPlayPhoto();
            break;
          }
        }
      }
    })
    .catch((err) => {
      console.error("Fetch error: ", err);
      alert("Something went wrong");
    });
}
