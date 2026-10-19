const express = require('express');

// ── App1 — puerto 3000 ──
const app1 = express();
app1.use((req, res, next) => {
    console.log(`[Servidor-3000] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'PHP/7.4.0');
    res.setHeader('Server', 'Apache/2.4.41 (Ubuntu)');
    next();
});
app1.get('/', (req, res) => res.json({ mensaje: 'API Atalanta funciona' }));
app1.post('/api/authentication/login', (req, res) => {
    res.json({ token: 'eyJhahsfaJOPKHhshaeiohewkl.lafgt', usuario: { id: 1, rol: 'admin' } });
});
app1.get('/api/v1/admin/panel', (req, res) => {
    res.json({ panel: 'admin', usuarios_activos: 14, version: '1.0.3', db: 'atalanta_db', ultimo_acceso: '2026-03-20 09:42:11' });
});
app1.get('/api/backup/credentials', (req, res) => {
    res.json({ db_user: 'root', db_pass: 'atalanta2026!', db_host: 'localhost', db_name: 'ATALANTA_DB' });
});
app1.post('/api/sistema/acceso', (req, res) => {
    res.json({ acceso: 'concedido', token: 'eyJhbGciOiJIUzI1NiJ9.fake.token123', nivel: 'superadmin', expira: '2026-12-31' });
});
app1.get('/api/tickets', (req, res) => {
    res.json({ tickets: [
        { id: 1, titulo: 'Error al conectar con el servidor', estatus: 'Abierto' },
        { id: 2, titulo: 'Fallo en el login', estatus: 'Cerrado' }
    ]});
});
app1.get('/admin/settings', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Access Granted</title></head>
        <body style="margin:0; background:#000;">
            <img src="https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif" width="100%">
        </body>
        </html>
    `);
});
app1.listen(3000, () => console.log('Servidor corriendo localmente en el puerto 3000'));

// ── App2 — puerto 8080 ──
const app2 = express();
app2.use((req, res, next) => {
    console.log(`[Servidor-8080] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'PHP/8.0.3');
    res.setHeader('Server', 'nginx/1.18.0');
    next();
});
app2.get('/admin', (req, res) => res.json({ panel: true, version: '2.1', db: 'atalanta_db' }));
app2.get('/api/usuarios', (req, res) => {
    res.json([
        { id: 1, email: 'admin@atalanta.com', password: '$2b$10$fakehashadmin' },
        { id: 2, email: 'root@atalanta.com',  password: '$2b$10$fakehashroot'  }
    ]);
});
app2.get('/api/v1/admin/panel', (req, res) => {
    res.json({ status: 'ok', servidor: 'produccion', bd_activa: 'atalanta_backup', registros: 2847 });
});
app2.get('/api/backup/credentials', (req, res) => {
    res.json({ mysql_root: 'root1234!', mysql_backup: 'backup2026', ssh_user: 'atalanta', ssh_pass: 'ssh_atalanta!' });
});
app2.listen(8080, () => console.log('Servidor corriendo localmente en el puerto 8080'));

// ── App3 — puerto 9000 ──
const app3 = express();
app3.use((req, res, next) => {
    console.log(`[Servidor-9000] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'ASP.NET');
    res.setHeader('Server', 'Microsoft-IIS/10.0');
    next();
});
app3.get('/api/auth/usuarios', (req, res) => {
    res.json({ usuarios: [
        { id: 1, nombre: 'Admin', email: 'admin@atalanta.com', rol: 'admin' }
    ]});
});
app3.post('/api/auth/register', (req, res) => {
    res.status(201).json({ mensaje: 'Usuario creado correctamente', id: 99 });
});
app3.listen(9000, () => console.log('Servidor corriendo localmente en el puerto 9000'));

// ── App4 — puerto 7432 ──
const app4 = express();
app4.use((req, res, next) => {
    console.log(`[Servidor-7432] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'PHP/5.6.40');
    res.setHeader('Server', 'Apache/2.2.34 (Unix)');
    next();
});
app4.get('/', (req, res) => res.json({ status: 'ok', app: 'Atalanta API v2' }));
app4.get('/api/users', (req, res) => {
    res.json({ users: [
        { id: 1, username: 'admin', email: 'admin@atalanta.com', role: 'superadmin' },
        { id: 2, username: 'manager', email: 'manager@atalanta.com', role: 'manager' },
        { id: 3, username: 'devops', email: 'devops@atalanta.com', role: 'admin' }
    ]});
});
app4.get('/api/config', (req, res) => {
    res.json({ db_host: 'localhost', db_port: 3306, db_name: 'atalanta_v2', jwt_secret: 'atalanta_jwt_2026!', environment: 'production' });
});
app4.post('/api/auth/login', (req, res) => {
    res.json({ token: 'eyJhbGciOiJIUzI1NiJ9.v2.faketoken456', usuario: { id: 1, rol: 'superadmin' }, expires: '24h' });
});
app4.get('/api/logs', (req, res) => {
    res.json({ logs: [
        { fecha: '2026-03-20 08:12:33', accion: 'LOGIN', usuario: 'admin', ip: '192.168.128.100' },
        { fecha: '2026-03-20 08:45:11', accion: 'DELETE_USER', usuario: 'admin', ip: '192.168.128.100' },
        { fecha: '2026-03-20 09:01:55', accion: 'EXPORT_DB', usuario: 'devops', ip: '192.168.128.102' }
    ]});
});
app4.listen(7432, () => console.log('Servidor corriendo localmente en el puerto 7432'));

// ── App5 — puerto 2587 ──
const app5 = express();
app5.use((req, res, next) => {
    console.log(`[Servidor-2587] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'Express/4.18.2');
    res.setHeader('Server', 'nginx/1.20.1');
    next();
});
app5.get('/', (req, res) => res.json({ mensaje: 'Panel de administración Atalanta' }));
app5.get('/admin/dashboard', (req, res) => {
    res.json({ total_usuarios: 47, tickets_abiertos: 12, tickets_cerrados: 89, ingresos_mes: '12.450€', servidor: 'PROD-01' });
});
app5.get('/admin/usuarios', (req, res) => {
    res.json({ usuarios: [
        { id: 1, nombre: 'Administrador', email: 'admin@atalanta.com', password: '$2b$12$fakehashadminprod', rol: 'admin', ultimo_login: '2026-03-20' },
        { id: 2, nombre: 'Jefe Operaciones', email: 'jefe@atalanta.com', password: '$2b$12$fakehashjefeXYZ', rol: 'jefe', ultimo_login: '2026-03-19' },
        { id: 3, nombre: 'Carlos Técnico', email: 'carlos@atalanta.com', password: '$2b$12$fakehashcarlos123', rol: 'trabajador', ultimo_login: '2026-03-18' }
    ]});
});
app5.get('/admin/backup', (req, res) => {
    res.json({ ultimo_backup: '2026-03-20 03:00:00', archivo: 'atalanta_backup_20260320.sql', size: '45MB', estado: 'completado' });
});
app5.post('/admin/login', (req, res) => {
    res.json({ acceso: true, token: 'eyJhbGciOiJIUzI1NiJ9.admin.faketoken789', nivel: 'admin', session_id: 'sess_abc123xyz' });
});
app5.listen(2587, () => console.log('Servidor corriendo localmente en el puerto 2587'));

// ── App6 — puerto 6391 ──
const app6 = express();
app6.use((req, res, next) => {
    console.log(`[Servidor-6391] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'Laravel/9.0');
    res.setHeader('Server', 'Apache/2.4.52 (Debian)');
    next();
});
app6.get('/', (req, res) => res.json({ app: 'Atalanta Internal API', version: '3.1.2', env: 'production' }));
app6.get('/api/credenciales', (req, res) => {
    res.json({
        mysql: { host: 'localhost', port: 3306, user: 'atalanta_admin', password: 'Atl4nt4_S3cur3!' },
        redis: { host: 'localhost', port: 6379, password: 'redis_atalanta_2026' },
        smtp: { host: 'smtp.atalanta.com', port: 587, user: 'no-reply@atalanta.com', password: 'smtp_pass_2026!' }
    });
});
app6.get('/api/internal/tokens', (req, res) => {
    res.json({ tokens: [
        { usuario: 'admin', token: 'eyJhbGciOiJIUzI1NiJ9.internal.token001', activo: true },
        { usuario: 'sistema', token: 'eyJhbGciOiJIUzI1NiJ9.internal.token002', activo: true },
        { usuario: 'backup_service', token: 'eyJhbGciOiJIUzI1NiJ9.internal.token003', activo: false }
    ]});
});
app6.get('/api/sistema/estado', (req, res) => {
    res.json({ cpu: '23%', memoria: '4.2GB/16GB', disco: '120GB/500GB', uptime: '47 dias', procesos_activos: 12 });
});
app6.post('/api/internal/acceso', (req, res) => {
    res.status(201).json({ acceso: 'concedido', nivel: 'sistema', token: 'eyJhbGciOiJIUzI1NiJ9.sistema.faketoken321', expira: '2026-12-31' });
});
app6.listen(6391, () => console.log('Servidor corriendo localmente en el puerto 6391'));

// ── App7 — puerto 5000 ──
const app7 = express();
app7.use((req, res, next) => {
    console.log(`[Servidor-5000] ${new Date().toLocaleTimeString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    res.setHeader('X-Powered-By', 'Express/4.18.2');
    res.setHeader('Server', 'nginx/1.20.1');
    next();
});
app7.get('/', (req, res) => res.json({ mensaje: 'Panel de administración Atalanta' }));
app7.get('/admin/dashboard', (req, res) => {
    res.json({ total_usuarios: 47, tickets_abiertos: 12, tickets_cerrados: 89, ingresos_mes: '12.450€', servidor: 'PROD-01' });
});
app7.get('/admin/usuarios', (req, res) => {
    res.json({ usuarios: [
        { id: 1, nombre: 'Administrador', email: 'admin@atalanta.com', password: '$2b$12$fakehashadminprod', rol: 'admin', ultimo_login: '2026-03-20' },
        { id: 2, nombre: 'Jefe Operaciones', email: 'jefe@atalanta.com', password: '$2b$12$fakehashjefeXYZ', rol: 'jefe', ultimo_login: '2026-03-19' },
        { id: 3, nombre: 'Carlos Técnico', email: 'carlos@atalanta.com', password: '$2b$12$fakehashcarlos123', rol: 'trabajador', ultimo_login: '2026-03-18' }
    ]});
});
app7.get('/admin/backup', (req, res) => {
    res.json({ ultimo_backup: '2026-03-20 03:00:00', archivo: 'atalanta_backup_20260320.sql', size: '45MB', estado: 'completado' });
});
app7.post('/admin/login', (req, res) => {
    res.json({ acceso: true, token: 'eyJhbGciOiJIUzI1NiJ9.admin.faketoken789', nivel: 'admin', session_id: 'sess_abc123xyz' });
});
app7.get('/api/config', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>403 Forbidden</title></head>
        <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column;">
            <img src="https://media.giphy.com/media/njYrp176NQsHS/giphy.gif" style="width:100%; max-width:800px;">
            <h1 style="color:white; font-size:4em; text-align:center;">YOU SHALL NOT PASS</h1>
            <audio autoplay loop>
                <source src="https://www.myinstants.com/media/sounds/you-shall-not-pass.mp3">
            </audio>
        </body>
        </html>
    `);
});
app7.listen(5000, () => console.log('Servidor corriendo localmente en el puerto 5000'));