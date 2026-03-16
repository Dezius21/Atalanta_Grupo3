const express = require('express');
const router = express.Router();
const {getNoticias, getNoticiasPorSlug, crearNoticia, eliminarNoticia} = require('../controllers/noticeController');
const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware');
const multer = require('multer');
const path= require('path');
const {validarNoticia} = require('../middlewares/validaciones')

router.get('/', getNoticias);
router.get('/:slug', getNoticiasPorSlug)

router.delete('/:id',protegerRuta,verificarRol('admin'), eliminarNoticia);


const storage = multer.diskStorage({
    destination: path.join(__dirname, '../subida'),
    filename: (req,file,cb) =>{
        cb(null, Date.now()+ path.extname(file.originalname));
    }
});

const fileFilter = (req,file,cb) =>{
    const extAllowed = /jpeg|jpg|png|gif|webp/;
    const extValid = extAllowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)
            || file.mimetype === 'application/octet-stream';
    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Solo se aceptan: jpeg, jpg, png, gif, webp'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 *1024 * 1024}
});

router.post('/', protegerRuta,verificarRol('admin','jefe'),validarNoticia,upload.single('imagen'),crearNoticia);
module.exports= router;