import { handlers } from "./handlers.js";

let wsInstance = null;

export function initWebSocket(playerId) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host;
    const wsUrl = `${protocol}//${wsHost}/ws`;
    console.log("Attempting websocket connection to: ", wsUrl);
    wsInstance = new WebSocket(wsUrl);

    wsInstance.onopen = () => {
        console.log("Connected to WebSocket Server");
        try {
            wsSend({ type: "join", playerId });
        } catch (err) {
            console.error("Failed to send join message", err);
        }
    };

    wsInstance.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const handler = handlers[data.type];
        if (handler) handler(data);
        else console.warn(`Unhandled message type: ${data.type}`);
    };

    wsInstance.onerror = (e) => {
        console.error("WebSocket error:", e);
        alert("Connection error. Attempting to reconnect...");
        console.log(`Reconnection attempt in 5 seconds (playerId: ${playerId})`);
        setTimeout(() => initWebSocket(playerId), 5000);
    };
    wsInstance.onclose = () => {
        console.log("Disconnected from WebSocket server");
        alert("Disconnected from server. Attempting to reconnect...");
        console.log(`Reconnection attempt in 5 seconds (playerId: ${playerId})`);
        setTimeout(() => initWebSocket(playerId), 5000);
    };
}

export function setWebSocket(ws) {
    wsInstance = ws;
}

export function wsSend(data) {
    if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not available");
        return;
    }

    wsInstance.send(JSON.stringify(data));
}
