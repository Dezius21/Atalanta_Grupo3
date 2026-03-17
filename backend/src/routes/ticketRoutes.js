const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const{
    crearTicket,
    obtenerTickets,
    obtenerTicket,
    asignarTicket,
    actualizarEstatus,
    crearComentario,
    subirAdjunto,
    borrarAdjunto
} = require('../controllers/ticketController');


const storage = multer.diskStorage({
    destination: path.join(__dirname, '../subida/tickets'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const extAllowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx/;
    const extValid = extAllowed.test(path.extname(file.originalname).toLowerCase());
    if (extValid) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Usa: jpeg, jpg, png, gif, webp, pdf, doc, docx, xls, xlsx'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware');

//Todos pueden ver sus tickets
router.get('/', protegerRuta , obtenerTickets);
// Solo cliente y jefe pueden crear tickets
router.post('/', protegerRuta, verificarRol('cliente', 'jefe', 'admin'), crearTicket);

// Ver un ticket específico — el controller filtra por rol
router.get('/:id', protegerRuta, obtenerTicket);

// Solo jefe y admin pueden asignar tickets a trabajadores
router.patch('/:id/asignar', protegerRuta, verificarRol('jefe', 'admin'), asignarTicket);

// Trabajador, jefe y admin pueden cambiar estatus
router.patch('/:id/estatus', protegerRuta, verificarRol('trabajador', 'jefe', 'admin'), actualizarEstatus);

// ─── COMENTARIOS ─────────────────────────────────────────────────────────────

// Todos los roles pueden comentar — el controller filtra por rol
router.post('/:id/comentarios', protegerRuta, crearComentario);

// ─── ADJUNTOS ─────────────────────────────────────────────────────────────────

// Subir adjunto a un ticket
router.post('/:id/adjuntos', protegerRuta, upload.single('archivo'), subirAdjunto);

// Borrar adjunto específico de un ticket
router.delete('/:ticket_id/adjuntos/:adjunto_id', protegerRuta, borrarAdjunto);

module.exports = router;