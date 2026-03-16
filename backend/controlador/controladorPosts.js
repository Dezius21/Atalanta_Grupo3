const db = require("../database/connection");

exports.createPost = async (req, res) => {
  const { titulo, contenido } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: "Error: Hace falta un titulo" });
  }
  if (!contenido || !contenido.trim()) {
    return res.status(400).json({ error: "Error:El contenido esta vacio" });
  }
  if (titulo.length > 255) {
    return res.status(400).json({ error: "Error: El titulo debe tener un maximo de 255 caracteres" });
  }

  const imagePath = req.file ? req.file.filename : null;

  try {
    const query = `
      INSERT INTO posts (titulo, contenido, destino_imagen)
      VALUES (?, ?, ?)
    `;
    await db.query(query, [titulo.trim(), contenido.trim(), imagePath]);
    res.status(201).json({ message: "Post creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo crear el post" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, titulo, contenido, destino_imagen, fecha_creacion FROM posts ORDER BY fecha_creacion DESC"
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procurar los posts" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM posts WHERE id = ?", [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la noticia" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM posts WHERE id = ?", [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Noticia no encontrada" });
    }
    res.json({ message: "Noticia eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la noticia" });
  }
};
