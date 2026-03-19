const pool=require('../config/db');

const Contacto = {
    //Insertar en contactos_general
    crearGeneral: async (data) => {
        const{nombre, apellidos, email, empresa, cargo, mensaje} = data;
        const[result]=await pool.execute(
            'INSERT INTO contactos_general(nombre, apellidos, email, empresa, cargo, mensaje) VALUES(?,?,?,?,?,?)',
            [nombre, apellidos, email, empresa, cargo, mensaje]
        );
        return result.insertId;
    },

    //Insertar en contactos_servicios
    crearServicio: async (data) => {
        const {nombre, apellidos, email, empresa, cargo, interes, mensaje} = data;
        const [result] = await pool.execute(
            'INSERT INTO contactos_servicios(nombre, apellidos, email, empresa, cargo, interes, mensaje) VALUES (?,?,?,?,?,?,?)', // <-- Falta coma aquí
            [nombre, apellidos, email, empresa, cargo, interes, mensaje]
        );
        return result.insertId; // <-- 'insertId' debe ser con 'i' minúscula
    },

    crearFormacion: async (data) => {
        const {nombre, apellidos, email, empresa, cargo, interes, tamaño} = data;
        const [result] = await pool.execute(
            'INSERT INTO contactos_formacion (nombre, apellidos, email, empresa, cargo, interes, tamaño) VALUES (?,?,?,?,?,?,?)', // <-- Falta coma aquí
            [nombre, apellidos, email, empresa, cargo, interes, tamaño]
        );
        return result.insertId; // <-- 'insertId' debe ser con 'i' minúscula
    }
};

module.exports = Contacto;
