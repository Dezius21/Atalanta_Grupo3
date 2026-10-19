const argon2 = require('argon2');
const pool = require('../config/db');

const seedAdmin = async () => {
    try {
        // ── Admin ──
        const [adminRows] = await pool.execute(
            "SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1"
        );
        if (adminRows.length === 0) {
            if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
                console.error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en .env');
                return;
            }
            const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD);
            await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                ['Administrador', process.env.ADMIN_EMAIL, hashedPassword, 'admin']
            );
            console.log('Admin creado correctamente');
        } else {
            console.log('Admin ya existe seed');
        }

        // ── Jefe ──
        const [jefeRows] = await pool.execute(
            "SELECT id FROM usuarios WHERE rol = 'jefe' LIMIT 1"
        );
        if (jefeRows.length === 0) {
            const hashedJefe = await argon2.hash(process.env.JEFE_PASSWORD);
            await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                ['Jefe Operaciones', process.env.JEFE_EMAIL, hashedJefe, 'jefe']
            );
            console.log('Jefe creado correctamente');
        } else {
            console.log('Jefe ya existe seed');
        }

        // ── Trabajador 1 ──
        const [trab1Rows] = await pool.execute(
            "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
            [process.env.TRABAJADOR1_EMAIL]
        );
        if (trab1Rows.length === 0) {
            const hashedTrab1 = await argon2.hash(process.env.TRABAJADOR1_PASSWORD);
            await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                ['Carlos Técnico', process.env.TRABAJADOR1_EMAIL, hashedTrab1, 'trabajador']
            );
            console.log('Trabajador 1 creado correctamente');
        } else {
            console.log('Trabajador 1 ya existe seed');
        }

        // ── Trabajador 2 ──
        const [trab2Rows] = await pool.execute(
            "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
            [process.env.TRABAJADOR2_EMAIL]
        );
        if (trab2Rows.length === 0) {
            const hashedTrab2 = await argon2.hash(process.env.TRABAJADOR2_PASSWORD);
            await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                ['Laura Soporte', process.env.TRABAJADOR2_EMAIL, hashedTrab2, 'trabajador']
            );
            console.log('Trabajador 2 creado correctamente');
        } else {
            console.log('Trabajador 2 ya existe seed');
        }

    } catch (error) {
        console.error('ERROR EN SEED', error.message);
    }
};

module.exports = seedAdmin;