const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const db = require('./config/db');
const rateLimit = require('express-rate-limit');
const app = express();
const path = require('path');
const seedAdmin = require('./scripts/seed');
//-Seguridad-//
app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'Self'", "'unsafe-inline'"],
          imgSrc: ["'Self'", "data:", "blob:"]
      }
  }
}));

app.use(cors({
    origin: function (origin, callback) {
      // Permite null (archivo local), localhost:5500 y localhost:5173 etc.
      const allowed = [
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost',
        'http://192.168.56.1',
        'http://172.26.96.11',
        'http://172.24.224.1',
        'http://172.23.144.1',
        'http://192.168.128.108',
        'http://192.168.128.65',
        'http://192.168.128.187',
        'http://172.22.48.1',
        'http://192.168.128.229',
        'http://172.20.96.1',
        'http://localhost',
        'http://172.24.224.1',
        'http://10.0.0.20',
        'http://192.168.128.122',
        'http://192.168.128.238',
        'http://192.168.128.245'

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
    windowMs: 15 * 60 *1000,
    max: 5,
    message: {error: 'Demasiadas peticiones intenta mas tarde'}
})

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const noticeRoutes = require('./routes/noticeRoutes');
app.use('/api/noticias', noticeRoutes);

const contactRoutes= require('./routes/contactRoutes');
app.use('/api/contacto',contactRoutes);

const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

app.use('/subida', express.static(path.join(__dirname, 'subida')));
router.get('/:slug', (req, res, next) => {
    console.log('Slug recibido:', req.params.slug);
    next();
}, getNoticiasPorSlug);

app.get('/', (req , res) => {
    res. json({mensaje: 'API Atalanta funciona'})
});

router.get('/:slug', (req, res, next) => {
  console.log('Slug recibido:', req.params.slug);
  next();
}, getNoticiasPorSlug);

seedAdmin();

const PORT = process.env.PORT || 8921;
app.listen(PORT, () =>{
    console.log(`Servidor corriendo localmente en http://localhost:${PORT}`);
})

