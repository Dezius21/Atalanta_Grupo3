const express = require('express');
const router = express.Router();

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
router.post('/:id/adjuntos', protegerRuta, subirAdjunto);

// Borrar adjunto específico de un ticket
router.delete('/:ticket_id/adjuntos/:adjunto_id', protegerRuta, borrarAdjunto);

module.exports = router;