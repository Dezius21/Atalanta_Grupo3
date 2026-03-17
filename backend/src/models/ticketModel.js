const pool = require('../config/db');

const crearTickets = async (autor_id, titulo, contenido) => {
    const [result] = await pool.execute(
        'INSERT INTO tickets (autor_id, titulo, contenido) VAlUES (?,?,?)', 
        [autor_id,titulo,contenido]
    );
    return result.insertId;
};

const obtenerTodosLosTickets = async () =>{
    const [rows] = await pool.execute(`
        SELECT
            t.id,
            t.titulo,
            t.contenido,
            t.estatus,
            t.created_at,
            t.updated_at,
            u1.nombre AS nombre_autor,
            u1.email AS email_autor,
            u2.nombre as asignado_nombre,
            u2.email as asignado_email
            FROM tickets t 
            LEFT JOIN usuarios u1 ON t.autor_id = u1.id
            LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
            ORDER BY t.created_at DESC
        `)

        return rows;
};

const obtenerTicketPorCliente= async (autor_id) =>{
    const [rows] = await pool.execute(`
        SELECT
            t.id,
            t.titulo,
            t.contenido,
            t.estatus,
            t.created_at,
            t.updated_at,
            u2.nombre as nombre_asignado
            FROM tickets t 
            LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
            WHERE t.autor_id = ? 
            ORDER BY t.created_AT DESC`,
            [autor_id]);
        return rows;
};

const obtenerTicketPorTrabajador = async (trabajador_id) =>{
    const [rows] = await pool.execute(`
       SELECT
            t.id,
            t.titulo,
            t.contenido,
            t.estatus,
            t.created_at,
            t.updated_at,
            u1.nombre AS nombre_autor,
            u1.email  AS email_autor
        FROM tickets t
        LEFT JOIN usuarios u1 ON t.autor_id = u1.id
        WHERE t.asignado_a = ?
        ORDER BY t.created_at DESC
    `, [trabajador_id]);
    return rows;
}

const obtenerTicketPorId = async (id) =>{
    const [rows] = await pool.execute(`
        SELECT
        t.*,
        u1.nombre AS autor_nombre,
        u1.email  AS autor_email,
        u2.nombre AS asignado_nombre,
        u2.email  AS asignado_email
        FROM tickets t 
        LEFT JOIN usuarios u1 ON t.autor_id = u1.id
        LEFT JOIN usuarios u2 ON t.asignado_a = u2.id
        WHERE t.id = ?`,
        [id]);
        return rows[0];
};

const asignarTickets = async (ticket_id, trabajador_id) => {
    const [result] = await pool.execute(
        "UPDATE tickets SET asignado_a = ?, estatus = 'Asignado', updated_at = NOW() WHERE id = ?",
        [trabajador_id, ticket_id]
    );
    return result.affectedRows;
}

const cambiarEstatus = async (ticket_id, estatus) => {
    const [result] = await pool.execute(
        'UPDATE tickets SET estatus = ?, updated_at = NOW() WHERE id = ?',
        [estatus, ticket_id]
    );
    return result.affectedRows;
};


const agregarComentario = async (ticket_id, autor_id, comentario, tipo = 'comentario') => {
    const [result] = await pool.execute(
        'INSERT INTO comentarios (ticket_id, autor_id, comentario, tipo) VALUES (?,?,?,?)',
        [ticket_id, autor_id, comentario, tipo]
    );
    return result.insertId;
};

const obtenerComentariosPorTicket = async (ticket_id) => {
    const [rows] = await pool.execute(`
        SELECT 
            c.id,
            c.comentario,
            c.tipo,
            c.created_at,
            u.nombre AS autor_nombre,
            u.rol    AS autor_rol
        FROM comentarios c
        LEFT JOIN usuarios u ON c.autor_id = u.id
        WHERE c.ticket_id = ?
        ORDER BY c.created_at ASC
    `, [ticket_id]);
    return rows;
};

const agregarAdjunto = async (ticket_id,url, nombre=null)=>{
    const[conteo] = await pool.execute(
        'SELECT COUNT(*) AS total FROM adjuntos WHERE ticket_id = ?', [ticket_id]
    );

    if(conteo[0].total >= 5){
        throw new Error ('ESte ticket ya tiene los 5 archivos permitidos')
    }

    const [result] = await pool.execute(
        'Insert INTO adjuntos (ticket_id, url, nombre) VALUES (?,?,?)',
        [ticket_id,url,nombre]
    );
    return result.insertId;
};

const obtenerAdjuntosPorTicket = async (ticket_id) => {
    const [rows] = await pool.execute(
        'SELECT id,url,nombre,created_at FROM adjuntos WHERE ticket_id = ?',
        [ticket_id]
    );
    return rows;
};

const eliminarAdjunto = async (adjunto_id, ticket_id) =>{
    const [result] = await pool.execute(
        'DELETE FROM adjuntos WHERE id = ? AND ticket_id = ?',
        [adjunto_id,ticket_id]
    );
    return result.affectedRows;
};

module.exports = {
    crearTickets,
    obtenerTodosLosTickets,
    obtenerTicketPorCliente,
    obtenerTicketPorTrabajador,
    obtenerTicketPorId,
    asignarTickets,
    cambiarEstatus,
    agregarComentario,
    obtenerComentariosPorTicket,
    agregarAdjunto,
    obtenerAdjuntosPorTicket,
    eliminarAdjunto
};