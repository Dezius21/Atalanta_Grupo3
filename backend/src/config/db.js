const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50
});
pool.getConnection()
    .then(conn =>{
        console.log('Conectado a MYSQL Correctamente');
        conn.release();
    })
    .catch(err => {
        console.error(' Error al conectar con MYSQL' , err.message);
    });

module.exports = pool;