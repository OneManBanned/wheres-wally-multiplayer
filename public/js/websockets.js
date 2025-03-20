import { startGame,  setFoundArr, setGameOver, setStartTime, } from "./game.js";
import { showLobby, showGame, updateThumbnails, switchToUnsolvedPuzzle, } from "./ui.js";

export function initWebSocket({
  playerId,
  allPuzzles,
  mainPuzzle,
}) {
  const ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    ws.send(JSON.stringify({ type: "join", playerId }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const { type, startTime, foundArr, gameId } = data;

    if (type === "init") {
      setFoundArr(foundArr);
      updateThumbnails(allPuzzles);
      showLobby();
    }
    if (type === "paired") {
      showGame();
      setStartTime(startTime);
      startGame();
    }

    if (type === "gameOver") {
      setGameOver();
      return alert("Game over");
    }

    if (type === "updateFound") {
        console.log(playerId)
      setFoundArr(foundArr);
      updateThumbnails(allPuzzles);
      const unsolvedIdx = foundArr.indexOf(false);
      if (unsolvedIdx !== -1)
        switchToUnsolvedPuzzle(mainPuzzle, puzzles, unsolvedIdx);
    }

    if (type === "opponentQuit") {
      console.log(`Opponent quit game ${gameId} is over`);
    }
  };

  ws.onclose = () => console.log("Disconnected from WebSocker server");
  ws.onerror = (e) => console.log("WebSocker error: ", e);
  
  return ws;
}
