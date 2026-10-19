const pool = require('../config/db');

const findByEmail = async (email) => {
    const [rows] =  await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
    )
    return rows[0];
};

const createUser = async (nombre, email, hashedPassword, rol = 'cliente') => {
    const [result] = await pool.execute(
        'INSERT INTO usuarios (nombre , email, password, rol) VALUES (?,?,?,?)',
        [nombre,email,hashedPassword,rol]
    );
    return result.insertId;
};

const cambiarRol = async (id, rol) => {
    const [result] = await pool.execute(
        'UPDATE usuarios SET rol = ? WHERE id = ?',
        [rol, id]
    );
    return result.affectedRows;
};

const obtenerTrabajadores = async () => {
    const [rows] = await pool.execute(
        "SELECT id,nombre,email FROM usuarios WHERE rol = 'trabajador'"
    );
    return rows;
}

const obtenerTrabajadoresYJefes = async () => {
    const [rows] = await pool.execute(
        "SELECT id, nombre, email, rol FROM usuarios WHERE rol IN ('trabajador', 'jefe')"
    );
    return rows;
};
module.exports = {findByEmail, createUser,cambiarRol,obtenerTrabajadores,obtenerTrabajadoresYJefes};