import { setPlayerStats } from "../game/state.js";
import { handlers } from "./handlers.js";
 
let wsInstance = null;

export function initWebSocket(playerId) {
    wsInstance = new WebSocket("ws://localhost:3000");

    wsInstance.onopen = () => {
        console.log("Connected to WebSocket Server");
        try {
            wsSend({ type: "join", playerId });
        } catch(err) {
            console.error("Failed to send join message", err)
            // TODO - Show reconnect UI
        }
    };

    wsInstance.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const handler = handlers[data.type];
        if (handler) {
            if (data.playerStats) setPlayerStats(data.playerStats)
            handler(data);
        }
        else console.warn(`Unhandled message type: ${data.type}`);
    };

    wsInstance.onclose = () => console.log("Disconnected from WebSocket server");
    wsInstance.onerror = (e) => console.log("WebSocker error: ", e);
}

export function setWebSocket(ws) {
    wsInstance = ws;
}

export function wsSend(data) {
    if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not available")
        return
    }

    wsInstance.send(JSON.stringify(data))
}
