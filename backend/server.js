const express = require("express");
const cors    = require("cors");
const path    = require("path");

const postsRoutes = require("./rutas/posts");

const app = express();

app.use(cors({
  origin: "http://localhost:5500"
}));

app.use(express.json());

// Serve uploaded images
app.use("/subida", express.static(path.join(__dirname, "subida")));

// Serve frontend files from root
app.use(express.static(path.join(__dirname, "..")));
app.use("/blocks", express.static(path.join(__dirname, "../blocks")));
app.use("/scripts", express.static(path.join(__dirname, "../scripts")));

app.use("/api/posts", postsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

app.listen(3000, () => {
  console.log("El servidor se conecto al puerto 3000");
});