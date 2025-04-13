export function extractImgPath(url) {
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

export function getCharFromImgPath(imagePath) {
    const filename = imagePath.split("/").pop();
    const character = filename.split(".")[0].split("-")[0];
    return character;
}

export const getOpponentId = (stats, player) =>
  Object.keys(stats).filter((id) => id !== player)[0];
