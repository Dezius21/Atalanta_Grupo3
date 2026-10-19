const express =require('express');
const router = express.Router();
const { loginLimiter } = require('../middlewares/rateLimiters');
const {validarRegister, validarLogin} = require('../middlewares/validaciones');
const{register,login,cambiarRolUsuario,listarTrabajadores,listarTrabajadoresYJefes}= require ('../controllers/authController');
const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware')

//-Rutas-//

router.post('/register', validarRegister, register);
router.post('/login',loginLimiter , validarLogin, login)

router.patch('/usuarios/:id/rol', protegerRuta, verificarRol('admin'),cambiarRolUsuario);

router.get('/usuarios', protegerRuta, verificarRol('admin', 'jefe'), listarTrabajadoresYJefes);
router.get('/trabajadores', protegerRuta, verificarRol('jefe', 'admin'), listarTrabajadores);
module.exports = router; //Exportacion del router

