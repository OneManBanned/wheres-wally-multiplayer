import WebSocket from "ws";

export function checkCharacterInRange(char, { x, y }, characters) {
  return (
    x >= characters[char].x &&
    x <= characters[char].x + characters[char].width &&
    y >= characters[char].y &&
    y <= characters[char].y + characters[char].height
  );
}

export const wsOpenSend = (ws, jsonData) => {
  if (!ws) {
    console.warn("WebSocket is undefined");
    return false;
  }
  if (ws.readyState !== WebSocket.OPEN) {
    console.warn(`WebSocket not open: readyState=${ws.readyState}`);
    return false;
  }
  try {
    ws.send(JSON.stringify(jsonData));
    return true;
  } catch (error) {
    console.error(`WebSocket send failed: ${error.message}`);
    return false;
  }
};

export function getGameByPlayerId(playerId, games) {
  for (const [id, gameData] of games) {
    if (gameData.players.includes(playerId)) {
      return { gameId: id, gameData };
    }
  }
}

export function getGameWsByPlayerId(playerId, gameData, clients) {
  const opponentsId = gameData.players.find((id) => id !== playerId);
  const opponentsWs = clients.get(opponentsId);
  const playersWs = clients.get(playerId);

  return { opponentsWs, playersWs };
}
