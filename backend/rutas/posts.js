const express = require("express");
const multer  = require("multer");
const path    = require("path");

const { createPost, getPosts,getPost,deletePost } = require("../controlador/controladorPosts");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "backend/subida",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extValid  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Solamente se aceptan estos formatos de imagen: jpeg, jpg, png, gif, webp"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB cap
});

router.post("/", upload.single("imagen"), createPost);
router.get("/",  getPosts);
router.get("/:id",    getPost);
router.delete("/:id", deletePost);

module.exports = router;
