import { startGame, checkCharacter, setFoundArr } from "./game.js";
import { setupPhoto, switchInPlayPhoto } from "./ui.js";

startGame();
setupPhoto(checkCharacter);

export const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
    console.log("Connected to WebSocket Server");
};

ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "init" || data.type === "updateFound") {
        console.log("webSocket", data)
        setFoundArr(data.foundArr)
        console.log("Updated foundArr: ", data.foundArr, data);
        switchInPlayPhoto();
    }
};

ws.onclose = () => {
    console.log("Disconnected from WebSocker server");
};

ws.onerror = (e) => {
    console.log("WebSocker error: ", e);
};
