const fs = require('fs');
const path = require('path');
const {crearTickets, obtenerTodosLosTickets,
    obtenerTicketPorCliente,
    obtenerTicketPorTrabajador,
    obtenerTicketPorId,
    asignarTickets,
    cambiarEstatus,
    agregarComentario,
    obtenerComentariosPorTicket,
    agregarAdjunto,
    eliminarAdjunto,
    obtenerAdjuntosPorTicket,
    contarTicketsActivos
} = require ('../models/ticketModel');

const crearTicket = async (req,res) => {
    try{
        const {titulo,contenido} = req.body;
        const autor_id = req.usuario.id;

        if(!titulo || !contenido){
            return res.status(400).json({error: 'TItulo y contenido son obligatorios'});
        }

        const tickesActivos = await contarTicketsActivos(autor_id);

        if(tickesActivos >= 5){
            return res.status(400).json({error: 'Tienes ya 5 tickets activos espera a que alguno finalice'})
        }
        const ticketId = await crearTickets(autor_id,titulo,contenido);

        res.status(201).json({
            mensaje: 'Ticker creado',
            ticketId: ticketId
        });
    }catch(error){
        console.error('Error al crear ticket', error.message);
        res.status(500).json({error: 'Error interno del servidor'});
    }
};

const obtenerTickets = async (req,res) =>{
    try{
        const {id, rol} = req.usuario;
        let tickets;

        if ( rol === 'admin' || rol === "jefe"){
            tickets = await obtenerTodosLosTickets();
        }else if (rol === 'trabajador'){
            tickets = await obtenerTicketPorTrabajador(id);
        }else if (rol === 'cliente'){
            tickets = await obtenerTicketPorCliente(id);
        }else{
            return res.status(403).json({
                error: 'Rol no reconocido'
            });
        }
        res.json({tickets});
    }catch(error){
            console.error('Error al obteer el ticket', error.menssage);
        res.status(500).json({error: 'Errpr interno del servidor'});
    }
};

const obtenerTicket = async (req,res) => {
    try{
        const {id: ticket_id} = req.params;
        const {id: usuario_id, rol}= req.usuario;

        const ticket = await obtenerTicketPorId(ticket_id);

        if(!ticket){
            return res.status(404).json({error: 'Ticket no encontrado'});
        }

        if(rol === 'cliente' && ticket.autor_id !== usuario_id){
            return res.status(403).json({error: 'No tienes permisos par ver este ticket'});
        }

        if(rol === 'trabajador' && ticket.asignado_a !== usuario_id){
            return res.status(403).json({error: 'No tienes permisos para ver este ticket'});
        }
        
        const  adjuntos = await obtenerAdjuntosPorTicket(ticket_id);
        const comentarios = await obtenerComentariosPorTicket(ticket_id);

        res.json({ticket,adjuntos,comentarios});

    }catch(error){
        console.error('Error al obtener ticket:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

//jefe a trabajador 
const asignarTicket = async (req,res) =>{
    try{
        const {id: ticket_id} = req.params;
        const {trabajador_id} = req.body;

        if(!trabajador_id){
            return res.status(400).json({error: 'id de trabajador es obligatorio'})
        }

        const ticket = await obtenerTicketPorId(ticket_id);
        if(!ticket){
            return res.status(404).json({error: 'Ticket no encontrado'});
        }

        if(ticket.estatus === 'Cerrado'){
            return res.status(400).json({error: 'No se puede asignar in ticket cerrado'});
        }

        await asignarTickets(ticket_id,trabajador_id);
        res.json({mensaje: 'Ticket asignado correctamente'});
    }catch(error){
        console.error('Error al asignar el ticket', error.message);
        res.status(500).json({error: 'Error interno del servidor'});
    }
};

//trabajador a ticket

const actualizarEstatus = async (req,res) =>{
    try{
        const {id: ticket_id} = req.params;
        const {estatus} = req.body;
        const {id: usuario_id, rol} = req.usuario;

        const estatusValidos = ['En_progreso', 'Cerrado'];
        if(!estatusValidos.includes(estatus)){
            return res.status(400).json({ error: `Estatus inválido. Usa: ${estatusValidos.join(', ')}` });
        }
        
        const ticket = await obtenerTicketPorId(ticket_id);
        if(!ticket){
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        if (rol === 'trabajador' && ticket.asignado_a !== usuario_id) {
            return res.status(403).json({ error: 'No puedes cambiar el estatus de este ticket' });
        }

        await cambiarEstatus(ticket_id, estatus);

        await agregarComentario(
            ticket_id,
            usuario_id,
            `Estatus cambiado a ${estatus}`,
            'cambio_estado'
        );

        res.json({ mensaje: 'Estatus actualizado correctamente' });
    }catch (error) {
        console.error('Error al actualizar estatus:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const crearComentario = async (req, res) => {
    try {
        const { id: ticket_id } = req.params;
        const { comentario } = req.body;
        const { id: usuario_id, rol } = req.usuario;

        if (!comentario) {
            return res.status(400).json({ error: 'El comentario no puede estar vacío' });
        }

        const ticket = await obtenerTicketPorId(ticket_id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        if (rol === 'cliente' && ticket.autor_id !== usuario_id) {
            return res.status(403).json({ error: 'No puedes comentar en este ticket' });
        }

        if (rol === 'trabajador' && ticket.asignado_a !== usuario_id) {
            return res.status(403).json({ error: 'No puedes comentar en este ticket' });
        }

        await agregarComentario(ticket_id, usuario_id, comentario, 'comentario');

        res.status(201).json({ mensaje: 'Comentario añadido correctamente' });

    } catch (error) {
        console.error('Error al crear comentario:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const subirAdjunto = async (req, res) => {
    try {
        const { id: ticket_id } = req.params;
        const { id: usuario_id, rol } = req.usuario;

        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo' });
        }

        const filename = Date.now() + path.extname(req.file.originalname);
        const carpeta = path.join(__dirname, '../subida/tickets');
        const filepath = path.join(carpeta, filename);

        if(!fs.existsSync(carpeta)){
            fs.mkdirSync(carpeta, {recursive: true});
        }

        fs.writeFileSync(filepath, req.file.buffer);




        const url    = `/subida/tickets/${filename}`;
        const nombre = req.file.originalname;

        const ticket = await obtenerTicketPorId(ticket_id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        if (rol === 'cliente' && ticket.autor_id !== usuario_id) {
            return res.status(403).json({ error: 'No puedes adjuntar archivos a este ticket' });
        }

        const adjuntoId = await agregarAdjunto(ticket_id, url, nombre);

        res.status(201).json({
            mensaje: 'Adjunto subido correctamente',
            adjunto_id: adjuntoId
        });

    } catch (error) {
        // El error de límite 5 viene del model
        if (error.message.includes('5 archivos')) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error al subir adjunto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const borrarAdjunto = async (req, res) => {
    try {
        const { ticket_id, adjunto_id } = req.params;
        const { id: usuario_id, rol } = req.usuario;

        const ticket = await obtenerTicketPorId(ticket_id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        if (rol === 'cliente' && ticket.autor_id !== usuario_id) {
            return res.status(403).json({ error: 'No puedes eliminar adjuntos de este ticket' });
        }

        const filasAfectadas = await eliminarAdjunto(adjunto_id, ticket_id);

        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Adjunto no encontrado' });
        }

        res.json({ mensaje: 'Adjunto eliminado correctamente' });

    } catch (error) {
        console.error('Error al borrar adjunto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    crearTicket,
    obtenerTickets,
    obtenerTicket,
    asignarTicket,
    actualizarEstatus,
    crearComentario,
    subirAdjunto,
    borrarAdjunto
};