export function extractImagePath(url) {
    const pathStart = url.indexOf("/images/");
    if (pathStart === -1) return null;
    return url.substring(pathStart);
}

export function getPathFromURL(url) {
    const parsedURL = new URL(url);
    return parsedURL.pathname;
}
export function positionInPercent(position, rect) {
    const { x, y } = position;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    return { xPercent, yPercent };
}

export function getCharacterFromImagePath(imagePath) {
    const filename = imagePath.split("/").pop();
    const character = filename.split(".")[0].split("-")[0];
    return character;
}
