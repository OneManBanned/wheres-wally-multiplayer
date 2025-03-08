const image = document.getElementById("photo");

image.addEventListener("click", playerTargeting);

const timerDisplay = document.querySelector("#timer");
let timeLeft = parseFloat(timerDisplay.dataset.timeLeft);
let gameActive = true;

function updateTimer() {
    if (gameActive && timeLeft > 0) {
        timeLeft -= 1;
        const minutes = Math.floor(timeLeft / 60)
        const seconds = Math.floor(timeLeft % 60).toString().padStart(2, '0')
        timerDisplay.textContent = `Time left: ${minutes}:${seconds}`
    } else {
        gameActive = false;
        timerDisplay.textContent = "Time's up!";
    }
}

setInterval(updateTimer, 1000)

function playerTargeting(e) {
    if (!gameActive || timeLeft <= 0) return;
    const rect = image.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const oldBox = document.getElementById("target-box");
    if (oldBox) oldBox.remove();

    createMarker(rect, x, y);

    for (let char in characters) {
        checkCharacter(char, xPercent, yPercent);
    }
}

function createMarker(rect, x, y) {
    const box = document.createElement("div");
    box.id = "target-box";

    const size = Math.max(Math.min(rect.width, rect.height) * 0.01, 10);

    box.style.left = `${x - size / 2}px`;
    box.style.top = `${y - size / 2}px`;
    box.style.width = `${size}px`;
    box.style.height = `${size}px`;

    document.getElementById("photo-container").appendChild(box);
}

function checkCharacter(char, x, y) {
    fetch("/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ char, x, y }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            if (data.success) {
                const marker = document.querySelector("#target-box");
                marker.style.backgroundColor = "green";
                timeLeft = data.timeLeft;
            }
        })
        .catch((err) => {
            console.error("Fetch error: ", err);
            alert("Something went wrong");
        });
}

window.addEventListener("resize", () => {
    const targetBox = document.getElementById("target-box");
    if (targetBox) {
        targetBox.remove();
    }
});
