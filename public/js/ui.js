import { findMarkerSize, getPhotoRect, getPathFromURL } from "./utils.js";

export function switchInPlayPhoto() {
    const images = document.querySelectorAll("#photo")
    console.log(images)
    images.forEach(img => {
        img.addEventListener("click", (e) => {
            document.querySelector("#inPlayPhoto").src = img.src;
        })
    })
}

export function createTargetingBox(x, y, checkCharacter, rect) {
    const box = document.createElement("div");
    box.id = "target-box";

    const markerSize = findMarkerSize(rect);

    box.style.left = `${x - markerSize / 2}px`;
    box.style.top = `${y - markerSize / 2}px`;
    box.style.width = `${markerSize}px`;
    box.style.height = `${markerSize}px`;

    document.getElementById("photo-container").appendChild(box);
    const img = document.querySelector("#inPlayPhoto")

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const pathname = getPathFromURL(img.src)

    for (let i = 0; i < images.length; ++i) {
        if (pathname === images[i]) {
            checkCharacter(i, xPercent, yPercent, rect);
        }
    }

}

export function setupPhoto(checkCharacter) {

    const image = document.getElementById("inPlayPhoto");
    image.addEventListener("click", (e) => {
        const rect = getPhotoRect(image);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const oldBox = document.querySelector('#target-box')
        if (oldBox) oldBox.remove();

        createTargetingBox(x, y, checkCharacter, rect)
    });
    // Magnifying glass placeholder
    image.addEventListener("mouseOver", (e) => {

    })
}

export function createMarker(position, size) {
}
