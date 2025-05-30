import WebSocket from "ws";

export function checkCharacterInRange(character, { x, y }, characters) {
  const { x: charX, y: charY, width, height } = characters[character];
  if (width === undefined || height === undefined) {
    console.error(`Missing dimensions for character ${character}`);
    return false;
  }
  return x >= charX && x <= charX + width && y >= charY && y <= charY + height
}

export function getGameWsByPlayerId(playerId, gameData, clients) {
  const opponentsId = gameData.players.find((id) => id !== playerId);
  return {
    playersWs: clients.get(playerId),
    opponentsWs: clients.get(opponentsId),
  };
}

export const wsOpenSend = (wsArr, jsonData) => {
  let allSent = true;

  wsArr.forEach((ws) => {
    if (!ws) {
      console.warn("WebSocket is undefined");
      allSent = false;
      return false;
    }
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn(`WebSocket not open: readyState=${ws.readyState}`);
      allSent = false;
      return false;
    }
    try {
      ws.send(JSON.stringify(jsonData));
    } catch (error) {
      console.error(`WebSocket send failed: ${error.message}`);
      allSent = false;
    }
  });

  return allSent;
};
