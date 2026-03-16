const express = require('express');
const router = express.Router();
const {getNoticias, getNoticiasPorSlug, crearNoticia, eliminarNoticia} = require('../controllers/noticeController');
const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware');
const multer = require('multer');
const path= require('path');

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
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);
    if(extValid && mimeValid){
        cb(null,true);
    }else{
        cb(new Error('Solo se aceptan: jpeg, jpg, png, gif,webp'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 *1024 * 1024}
});

router.post('/', protegerRuta,verificarRol('admin','jefe'),upload.single('imagen'),crearNoticia);
module.exports= router;