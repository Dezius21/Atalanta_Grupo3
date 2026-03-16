const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",      // change if your MySQL user is different
  password: "AlumnoIFP",      // add your MySQL password if you have one
  database: "blog_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Conexion con la base de datos fallida:", err);
    return;
  }
  console.log("Conectado a MySQL");
  connection.release();
});

module.exports = pool.promise();
