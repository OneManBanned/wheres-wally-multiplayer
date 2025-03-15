import { startGame, checkCharacter, setFoundArr } from "./game.js";
import { setupPhoto, switchInPlayPhoto } from "./ui.js";

startGame();
setupPhoto(checkCharacter);

export const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("Connected to WebSocket Server");
  ws.send(JSON.stringify({ type: "join", playerId }));
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === "init") {
    console.log(`Status: ${data.status}`);
    setFoundArr(data.foundArr);
  }
  if (data.type === "paired") {
    console.log(`Paired in ${data.gameId} vs ${data.opponentId}`);
  }

  if (data.type === "updateFound") {
    setFoundArr(data.foundArr);
    console.log(`Updated found array ${foundArr}`)
    switchInPlayPhoto();
  }

};

ws.onclose = () => {
  console.log("Disconnected from WebSocker server");
};

ws.onerror = (e) => {
  console.log("WebSocker error: ", e);
};
