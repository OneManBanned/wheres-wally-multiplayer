export const findMarkerSize = rect => Math.max(Math.min(rect.width, rect.height) * 0.01, 10);
export const getPhotoRect = img => img.getBoundingClientRect();
export function getPathFromURL(url) {
    const parsedURL = new URL(url)
    return parsedURL.pathname;
};
export function positionInPercent(position, rect) {
  const { x, y } = position;

  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  return { xPercent, yPercent };
};

