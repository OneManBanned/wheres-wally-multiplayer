
export function checkCharacterInRange(char, { x, y }, characters) {
  return (
    x >= characters[char].x &&
    x <= characters[char].x + characters[char].width &&
    y >= characters[char].y &&
    y <= characters[char].y + characters[char].height
  );
}

export const wsOpenSend = (ws, jsonData) => {
  if (ws?.readyState === ws.OPEN) ws.send(JSON.stringify(jsonData));
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
