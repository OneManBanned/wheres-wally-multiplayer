function getPhotoRect() {
    const photo = document.querySelector("#photo");
    return photo.getBoundingClientRect();
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

document.getElementById("photo").addEventListener("click", (e) => {
    const rect = getPhotoRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const oldBox = document.getElementById("target-box");
    if (oldBox) oldBox.remove();

    createMarker(rect, x, y);

    checkCharacter(xPercent, yPercent);
});

function checkCharacter(x, y) {
    fetch("/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y }),
    })
        .then((res) => res.json())
        .then((data) => console.log(data));
}
