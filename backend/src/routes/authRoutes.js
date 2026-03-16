const express =require('express');
const router = express.Router();
const{register, login} = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimiters');
const {validarRegister, validarLogin} = require('../middlewares/validaciones');

//-Rutas-//
router.post('/register', validarRegister, register);
router.post('/login',loginLimiter , validarLogin, login)

module.exports = router; //Exportacion del router

