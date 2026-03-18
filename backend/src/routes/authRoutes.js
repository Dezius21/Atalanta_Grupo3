const express =require('express');
const router = express.Router();
const { loginLimiter } = require('../middlewares/rateLimiters');
const {validarRegister, validarLogin} = require('../middlewares/validaciones');
const{register,login,cambiarRolUsuario}= require ('../controllers/authController');
const {protegerRuta, verificarRol} = require('../middlewares/authMiddleware')

//-Rutas-//
router.post('/register', validarRegister, register);
router.post('/login',loginLimiter , validarLogin, login)

router.patch('/usuarios/:id/rol', protegerRuta, verificarRol('admin'),cambiarRolUsuario);

module.exports = router; //Exportacion del router

