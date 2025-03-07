const image = document.getElementById("photo");

image.addEventListener("click", playerTargeting);

function playerTargeting(e) {
  const rect = image.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  const oldBox = document.getElementById("target-box");
  if (oldBox) oldBox.remove();

  createMarker(rect, x, y);
  checkCharacter(xPercent, yPercent);
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

function checkCharacter(x, y) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
          // instead of making a new marker we use #target-box element, change the color and remove the event listener
        const marker = document.querySelector("#target-box");
        marker.style.backgroundColor = "red";
        image.removeEventListener("click", playerTargeting);
      }
    })
    .catch((err) => {
      console.error("Fetch error: ", err);
      alert("Something went wrong");
    });
}

window.addEventListener('resize', () => {
  const targetBox = document.getElementById('target-box');
  if (targetBox) targetBox.remove();
});
