const pool = require('../config/db');

//Obtencion de toda las noticias publicas
const getNoticias = async (req,res) => {
    try{
        const [noticias] = await pool.execute(
            'SELECT id, titulo, slug, contenido, imagen_url, categoria, created_at FROM noticias WHERE publicado = true'
        );
        res.json(noticias);
    }catch (error){
        console.error('Error al obtener noticias:', error.message);
        res.status(500).json({error: 'Error interno del servidor'})
    }
};

const getNoticiasPorSlug = async (req,res) =>{
    try{
        const { slug } = req.params; 
        const [rows] = await pool.execute(
            'SELECT * FROM noticias WHERE slug = ? AND publicado = true', [slug]
        );
        if (rows.length === 0){ 
            return res.status(404).json({error: 'Noticia no encontrada'});
        }
        res.json(rows[0]); 
    }catch(error){
        console.error('Error al obtener noticia', error.message);
        res.status(500).json({error: 'Error interno del servidor'})
    }
};

//creacion de noticias (admin y jefe)
const crearNoticia = async (req,res) => {
    const imagen_url = req.file ? `/subida/${req.file.filename}` : null;
    try{
        const {titulo, contenido, categoria} = req.body;
        
        const slug = titulo.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g,'')
            .replace(/\s+/g, '-')       
            .replace(/[^\w-]/g, '');
                

        const [result] = await pool.execute(
            'INSERT INTO noticias (titulo, slug, contenido, imagen_url, categoria, publicado, autor_id) VALUES (?,?,?,?,?,?,?)',
            [titulo, slug, contenido, imagen_url, categoria, true, req.usuario.id]
        );
        res.status(201).json({mensaje: 'Noticia creada correctamente', id: result.insertId});
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({ error: 'Ya existe una noticia con un titulo similar. Usa un titulo diferente'});
        }
        console.error('Error al crear noticia', error.message);
        res.status(500).json({error: 'Error interno del servidor'});
    }
};

const eliminarNoticia = async(req,res) =>{
    try{
        const {id} = req.params; 
        const [result] = await pool.execute(
            'DELETE FROM noticias WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0){ 
            return res.status(404).json({error: 'Noticia no encontrada'});
        }
        res.json({mensaje: 'Noticia eliminada correctamente'});
    }catch(error){
        console.error('Error al eliminar noticia', error.message);
        res.status(500).json({error: 'Error interno del servidor'})
    }
};

module.exports = {getNoticias, getNoticiasPorSlug, crearNoticia, eliminarNoticia};
