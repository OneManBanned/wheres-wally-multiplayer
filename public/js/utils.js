export const findMarkerSize = rect => Math.max(Math.min(rect.width, rect.height) * 0.01, 10)
export const getPhotoRect = img => img.getBoundingClientRect();
export function getPathFromURL(url) {
    const parsedURL = new URL(url)
    return parsedURL.pathname;
}

