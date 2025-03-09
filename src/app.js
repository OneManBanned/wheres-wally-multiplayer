import express from "express";
import gameRoutes from "./routes/game.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.use("/", gameRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
