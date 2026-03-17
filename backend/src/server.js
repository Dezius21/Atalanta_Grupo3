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
    origin: function (origin, callback) {
      // Permite null (archivo local), localhost:5500 y localhost:5173 etc.
      const allowed = [
        'http://localhost:5500',
        'http://127.0.0.1:5500',   ////cambiar en post-produccion
        'http://localhost:5173',
        'http://192.168.56.1:5500'
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido para: ' + origin));
      }
    },
    credentials: true
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

