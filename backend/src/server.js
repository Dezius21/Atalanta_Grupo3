const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const db = require('./config/db');
const rateLimit = require('express-rate-limit');
const app = express();


//-Seguridad-//
app.use(helmet());

app.use(cors({
    origin: 'http://localhost:5500',
    credentials : true
}));

//-Rate limit(global)-//
const limiter = rateLimit({
    windowMs: 15* 60 *1000,
    max: 70,
    message: {error: 'Demasiadas peticiones intenta mas tarde'}
});

app.use(limiter);

//-Rate limit(login)-//
const loginLimiter = rateLimit({
    windowMs: 1 * 60 *1000, //cambiar para mas seguridad
    max: 15,
    message: {error: 'Demasiadas peticiones intenta mas tarde'}
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const noticeRoutes = require('./routes/noticeRoutes');
app.use('/api/noticias', noticeRoutes);

app.get('/', (req , res) => {
    res. json({mensaje: 'API Atalanta funciona'})
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
    console.log(`Servidor corriendo localmente en http://localhost:${PORT}`);
})

