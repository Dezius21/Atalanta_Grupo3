const express = require('express');
const router = express.Router();
const {getNoticias, getNoticiasPorSlug, crearNoticia, eliminarNoticia} = require('../controllers/noticeController');
const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware');

router.get('/', getNoticias);
router.get('/:slug', getNoticiasPorSlug)

router.post('/', protegerRuta, verificarRol('admin', 'jefe'), crearNoticia);
router.delete('/:id',protegerRuta,verificarRol('admin'), eliminarNoticia);

module.exports= router;