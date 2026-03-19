const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const {findByEmail, createUser, cambiarRol,obtenerTrabajadores, obtenerTrabajadoresYJefes} = require('../models/usermode');

//Cambiar Roles (solo admin)
const cambiarRolUsuario = async (req,res) =>{
    try{
        const {id} = req.params;
        const {rol} = req.body;

        const rolesValidos = ['admin', 'jefe', 'trabajador','cliente'];
        if(!rolesValidos.includes(rol)){
            return res.status(400).json({error: `Rol invalido usa: ${rolesValidos.join(', ')}`})
        };
        
        //el admin no se puede quitar el rol
        if(parseInt(id) === req.usuario.id && rol !== "admin"){
            return res.status(400).json({error: "No puedes cambiar tu propio rol"})
        }

        const filasAfectadas = await cambiarRol(id,rol);
        if(filasAfectadas === 0){
            return res.status(404).json({error: 'Usuario no encontrado'});
        }
        res.json({mensaje: `Rol actualizado a  ${rol}`});
    }catch(error){
        console.error('Error al cambiar el rol', error.message);
        res.status(500).json({error: 'Error interno del servidor'})
    }

};



//-Registro-//

const register = async (req , res) =>{
    try{
        const{nombre, email, password} = req.body; //poner rol para asignar un admin
        //comprobacion de el email en la DB
        const existingUser = await findByEmail(email);
        if(existingUser){
            return res.status(400).json({error: 'Error al procesar el registro'})
        }

        //hasheo de contraseña
        const hashedPassword = await argon2.hash(password);

        //creacion de user en DB
        const userId = await createUser(nombre,email, hashedPassword); //rol para asignar admin

        res.status(201).json({mensaje: 'Usuario creado correctamente'});

    }catch (error){
        console.error('Error en registro' , error.message);
        res.status(500).json({error: 'Error interno del servidor'})
    }
}
    

//-Login-//

const login = async (req,res) =>{
try{
    //Busqueda de usuario em la DB
    const{email,password} = req.body;
    
    const user = await findByEmail(email);
    if(!user){
        return res.status(401).json({error: 'Credenciales Incorrectas'})
    }

    //Comparacion de contraseña hash en DB
    const validPassword = await argon2.verify(user.password, password);
    if(!validPassword){
        return res.status(401).json({error: 'Credenciales incorrectas'});
    }

    //Generacion de token JWT con datos del usuario
    const token = jwt.sign(
        {id: user.id, email: user.email, rol: user.rol},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );

    res.json({
        mensaje:'Login correcto',
        token,
        usuario: {id: user.id, nombre: user.nombre, email: user.email, rol: user.rol},
    })

}catch(error){
    console.error('Error en login' , error.message);
    res.status(500).json({error: 'Error interno del servidor'})
}
};


const listarTrabajadores = async (req,res) =>{
    try{
        const trabajadores = await obtenerTrabajadores();
        res.json({trabajadores});
    }catch(error){
        console.error('Error al listar trabajadores', error.message)
        res.status(500).json({error: 'Error interno del servidor'});
    }
};

const listarTrabajadoresYJefes = async (req, res) => {
    try {
        const usuarios = await obtenerTrabajadoresYJefes();
        res.json({ usuarios });
    } catch (error) {
        console.error('Error al listar usuarios:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {register, login,cambiarRolUsuario, listarTrabajadores,listarTrabajadoresYJefes};
