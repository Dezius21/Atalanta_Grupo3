const pool = require('../config/db');

const crearTickets = async (autor_id, titulo, contenido,evidence_url = null) => {
    const [result] = await pool.execute(
        'INSERT INTO tickets (autor_id, titulo, contenido, evidence_url) VAlUES (?,?,?,?)', 
        [autor_id,titulo,contenido,evidence_url]
    );
    return result.insertId;
};

const obtenerTodosLosTickets = async () =>{
    const [rows] = await pool.execute(`
        SELECT
            t.id,
            t.titulo,
            t.contenido,
            t.evidence_url,
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
            t.evidence_url,
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
            t.evidence_url,
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
        "UPDATE tickets SET asignado_a = ?, estatus = 'Asignado', updated_at = NOW() WhERE id = ?",
        [trabajador_id, ticket_id]
    );
    return result.affectedRows;
}


module.exports = {
    crearTickets,
    obtenerTodosLosTickets,
    obtenerTicketPorCliente,
    obtenerTicketPorTrabajador,
    obtenerTicketPorId,
    asignarTickets,
    // Tu compañero añadirá aquí:
    // cambiarEstatus,
    // agregarComentario,
    // obtenerComentariosPorTicket
};