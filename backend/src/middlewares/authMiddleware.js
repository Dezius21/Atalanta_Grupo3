const ROLES_VALIDOS = ['admin', 'jefe', 'trabajador', 'cliente'];
const jwt = require('jsonwebtoken');

const protegerRuta = (req,res,next) =>{
    try {
        const authHeader = req.headers['authorization'];
        if(!authHeader){
            return res.status(401).json({error: 'Token Requerido'});
        }

        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({error: "Formato de token invalido"});
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    }catch(error){
        return res.status(401).json({error: 'Token invalido o expirado'});
    }
};

const verificarRol = (...roles) => {
    return (req,res,next) => {
        const rolesInvalidos = roles.filter(r => !ROLES_VALIDOS.includes(r));
        if(rolesInvalidos.length > 0){
            console.error(`Roles invalidos ${rolesInvalidos.join(', ')}`);
        }
        if (!req.usuario){
            return res.status(401).json({error: 'No autenticado'})
        }
        if(!roles.includes(req.usuario.rol)){
            return res.status(403).json({error: 'No tienes permisos suficientes'});
        }
        next();
    };
};

module.exports = {protegerRuta, verificarRol}