import express from "express";
import gameRoutes from "./routes/game.js";
import { WebSocketServer } from "ws";
import path, { dirname } from "path"
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url))

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

app.use("/", gameRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);
    let foundArr = Array(5).fill(false);

    ws.send(JSON.stringify({ type: "init", foundArr }));

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === "updateFound") {
            foundArr = data.foundArr;
            console.log(data)
        }

        clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: "updateFound", foundArr }));
            }
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        clients.delete(ws);
    });
});
