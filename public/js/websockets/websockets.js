import { setPlayerStats } from "../game/state.js";
import { handlers } from "./handlers.js";
 

export function initWebSocket(playerId) {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        console.log("Connected to WebSocket Server");
        try {
            wsSend(ws, { type: "join", playerId });
        } catch(err) {
            console.error("Failed to send join message", err)
            // TODO - Show reconnect UI
        }
    };

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const handler = handlers[data.type];
        if (handler) {
            setPlayerStats(data.playerStats)
            handler(data, ws);
        }
        else console.warn(`Unhandled message type: ${data.type}`);
    };

    ws.onclose = () => console.log("Disconnected from WebSocket server");
    ws.onerror = (e) => console.log("WebSocker error: ", e);
}

export const wsSend = (ws, jsonData) => ws.send(JSON.stringify(jsonData));
