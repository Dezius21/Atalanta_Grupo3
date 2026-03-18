const argon2 = require('argon2');
const pool = require('../config/db');

const seedAdmin = async () => {
    try{
        const [rows] = await pool.execute(
            "SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1"
        );

        if(rows.length>0){
            console.log('Admin ya existe seed');
            return;
        }

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en .env');
            return;
        }

        const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD);
        
        await pool.execute(
            'INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)',
            ['Administrador', process.env.ADMIN_EMAIL , hashedPassword , 'admin']
        );
        
        console.log('admin creado correctamente')
    }catch(error){
        console.error('ERROR EN SEED', error.message);
    }
};

module.exports = seedAdmin;