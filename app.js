import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

const waldo = {
    x: 48.31,
    y: 45.18,
    width: 1.25,
    height: 6.38,
};

app.get("/", (req, res) => {
    res.render("index", { photo: "/images/waldo.jpg" });
});

app.post("/check", (req, res) => {

    const { x, y } = req.body;

    const inRange =
        x >= waldo.x &&
        x <= waldo.x + waldo.width &&
        y >= waldo.y &&
        y <= waldo.y + waldo.height;

    res.json({
        success: inRange,
        message: inRange ? "You found Waldo" : "Try again!",
        position: inRange ? { x, y } : null,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
