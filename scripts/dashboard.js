// ==========================================
// 1. ESTADO GLOBAL Y UTILIDADES DE SEGURIDAD
// ==========================================
const currentUser = { id: 102, name: "Esther Howard", role: "Cliente" }; // Cambia para probar cada rol

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeRender(containerId, htmlString) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.replaceChildren(); 
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    while (doc.body.firstChild) {
        container.appendChild(doc.body.firstChild);
    }
}

// ==========================================
// 2. CONTRATO DE API (Para el equipo de Backend)
// ==========================================
// BACKEND DEVS: Reemplacen estas funciones por fetch() a sus endpoints.
// Deben devolver EXACTAMENTE esta estructura JSON.
const API_MOCK = {
    getUsers: async () => new Promise(res => setTimeout(() => res([
        { id: 101, name: "Cody Fisher", email: "cody@atalanta.com", role: "Jefe" }
    ]), 800)),
    
    getNews: async () => new Promise(res => setTimeout(() => res([
        { id: 1, title: "Parche Crítico", date: "16 Mar 2026", author: "Admin" }
    ]), 600)),

    getUnassignedTickets: async () => new Promise(res => setTimeout(() => res([
        { id: 302, asunto: "Error 500 en portal", cliente: "Esther Howard" }
    ]), 700)),

    getWorkerTickets: async (workerId) => new Promise(res => setTimeout(() => res([
        { 
            id: 302, asunto: "Error 500 en portal", estado: "Asignado", 
            archivos: [
                { nombre: "log_error.txt", url: "/uploads/log.txt" },
                { nombre: "captura.png", url: "/uploads/cap.png" }
            ] 
        }
    ]), 900)),

    getClientTickets: async (clientId) => new Promise(res => setTimeout(() => res([
        { id: 302, asunto: "Error 500 en portal", estado: "En progreso", respuesta: "Revisando logs." }
    ]), 500))
};

// ==========================================
// 3. CICLO DE VIDA Y ENRUTADOR ASÍNCRONO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("user-info").textContent = `${currentUser.name} | ${currentUser.role}`;
    renderSidebar(currentUser.role);
    initializeDashboard(currentUser.role);
});

async function initializeDashboard(role) {
    const title = document.getElementById("view-title");
    
    // Feedback visual bloqueante (Evita que el usuario interactúe antes de tiempo)
    safeRender("content-area", `<div class="panel" style="text-align:center; padding: 40px;"><h3>Conectando con el servidor de Atalanta...</h3><p>Por favor, espere.</p></div>`);

    try {
        switch(role) {
            case 'Admin':
                title.textContent = "Panel de Administración";
                const [users, news] = await Promise.all([API_MOCK.getUsers(), API_MOCK.getNews()]);
                safeRender("content-area", getAdminTemplate(users, news));
                break;
            case 'Jefe':
                title.textContent = "Asignación de Tickets";
                const unassigned = await API_MOCK.getUnassignedTickets();
                safeRender("content-area", getBossTemplate(unassigned));
                break;
            case 'Trabajador':
                title.textContent = "Tickets Asignados";
                const workerTickets = await API_MOCK.getWorkerTickets(currentUser.id);
                safeRender("content-area", getWorkerTemplate(workerTickets));
                break;
            case 'Cliente':
                title.textContent = "Mis Tickets";
                const clientTickets = await API_MOCK.getClientTickets(currentUser.id);
                safeRender("content-area", getClientTemplate(clientTickets));
                break;
        }
    } catch (error) {
        console.error("Error de integración:", error);
        safeRender("content-area", `<div class="panel"><h3 style="color: var(--color-danger);">Error crítico de conexión. Contacte a soporte IT.</h3></div>`);
    }
}

function renderSidebar(role) {
    safeRender("sidebar-nav", `
        <li class="sidebar__item sidebar__item--active">Dashboard</li>
        <li class="sidebar__item">Perfil</li>
        <li class="sidebar__item">Cerrar Sesión</li>
    `);
}

// ==========================================
// 4. GENERADORES DE VISTAS (Templates Dinámicos)
// ==========================================

function getAdminTemplate(users, news) {
    const usersRows = users.map(u => `
        <tr>
            <td>${escapeHTML(u.id)}</td><td>${escapeHTML(u.name)}</td>
            <td>
                <select class="form-control" id="role-select-${escapeHTML(u.id)}">
                    <option value="Trabajador" ${u.role === 'Trabajador' ? 'selected' : ''}>Trabajador</option>
                    <option value="Cliente" ${u.role === 'Cliente' ? 'selected' : ''}>Cliente</option>
                    <option value="Jefe" ${u.role === 'Jefe' ? 'selected' : ''}>Jefe</option>
                    <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td><button class="btn btn--success" onclick="alert('Llamada al backend para actualizar rol del ID: ${escapeHTML(u.id)}')">Actualizar Rol</button></td>
        </tr>
    `).join('');

    const newsRows = news.map(n => `
        <tr>
            <td>${escapeHTML(n.title)}</td><td>${escapeHTML(n.date)}</td>
            <td><button class="btn btn--danger">Eliminar</button></td>
        </tr>
    `).join('');

    return `
        <div class="panel">
            <div class="panel__header"><h3>Gestión de Usuarios</h3></div>
            <table class="table"><tr><th>ID</th><th>Nombre</th><th>Rol Actual</th><th>Acción</th></tr>${usersRows}</table>
        </div>
        <div class="panel">
            <div class="panel__header">
                <h3>Gestión de Noticias</h3>
                <button class="btn btn--primary" onclick="toggleAdminNewsModal(true)">Publicar Noticia</button>
            </div>
            <table class="table"><tr><th>Título</th><th>Fecha</th><th>Acción</th></tr>${newsRows}</table>
        </div>
        
        <div id="admin-news-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 450px;">
                <h3>Redactar Nueva Noticia</h3>
                <form id="form-admin-news" onsubmit="handleAdminNewsSubmit(event)">
                    <label class="form-label">Título</label>
                    <input type="text" id="news-title" class="form-control" required style="margin-bottom: 10px;">
                    <label class="form-label">Imagen de Portada</label>
                    <input type="file" id="news-image" class="form-control" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 10px;">
                    <label class="form-label">Contenido</label>
                    <textarea id="news-content" class="form-control" rows="4" required style="margin-bottom: 15px;"></textarea>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" class="btn btn--danger" onclick="toggleAdminNewsModal(false)">Cancelar</button>
                        <button type="submit" class="btn btn--success">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getBossTemplate(tickets) {
    if (!tickets.length) return `<div class="panel"><h3>No hay tickets pendientes.</h3></div>`;
    
    const rows = tickets.map(t => `
        <tr>
            <td>#${escapeHTML(t.id)}</td><td>${escapeHTML(t.asunto)}</td>
            <td>
                <select class="form-control" id="boss-assign-${escapeHTML(t.id)}">
                    <option value="" disabled selected>-- Asignar a --</option>
                    <option value="101">Cody Fisher (Trabajador)</option>
                </select>
            </td>
            <td><button class="btn btn--success" onclick="alert('Ticket ${escapeHTML(t.id)} asignado al trabajador seleccionado.')">Asignar</button></td>
        </tr>
    `).join('');

    return `<div class="panel"><div class="panel__header"><h3>Tickets Pendientes</h3></div><table class="table"><tr><th>ID</th><th>Asunto</th><th>Asignación</th><th>Acción</th></tr>${rows}</table></div>`;
}

function getWorkerTemplate(tickets) {
    if (!tickets.length) return `<div class="panel"><h3>No hay tareas asignadas.</h3></div>`;

    const rows = tickets.map(t => {
        let filesList = t.archivos ? t.archivos.map(f => `<li><a href="${escapeHTML(f.url)}" target="_blank" style="color: var(--color-primary);">${escapeHTML(f.nombre)}</a></li>`).join('') : '';
        let filesHTML = filesList ? `
            <button class="btn btn--primary" onclick="toggleFiles(${escapeHTML(t.id)})">Archivos (${t.archivos.length})</button>
            <ul id="files-${escapeHTML(t.id)}" style="display: none; padding: 10px; background: #f9f9f9; list-style:none; margin-top:5px;">${filesList}</ul>
        ` : 'Sin adjuntos';

        return `
            <tr>
                <td>#${escapeHTML(t.id)}</td><td>${escapeHTML(t.asunto)}</td>
                <td>
                    <select class="form-control">
                        <option value="Asignado" ${t.estado === 'Asignado' ? 'selected' : ''}>Asignado</option>
                        <option value="En progreso" ${t.estado === 'En progreso' ? 'selected' : ''}>En progreso</option>
                        <option value="Resuelto" ${t.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>${filesHTML}</td>
                <td style="vertical-align: top;"><button class="btn btn--success">Guardar</button></td>
            </tr>
        `;
    }).join('');

    return `<div class="panel"><div class="panel__header"><h3>Mis Tareas Activas</h3></div><table class="table"><tr><th>ID</th><th>Asunto</th><th>Estado</th><th>Archivos</th><th>Acción</th></tr>${rows}</table></div>`;
}

function getClientTemplate(tickets) {
    const historyRows = tickets.length ? tickets.map(t => `
        <tr><td>#${escapeHTML(t.id)}</td><td>${escapeHTML(t.asunto)}</td><td><strong>${escapeHTML(t.estado)}</strong></td><td>${escapeHTML(t.respuesta)}</td></tr>
    `).join('') : `<tr><td colspan="4">No has creado ningún ticket.</td></tr>`;

    return `
        <div class="panel">
            <div class="panel__header"><h3>Historial de Tickets</h3></div>
            <table class="table"><tr><th>ID</th><th>Asunto</th><th>Estado</th><th>Respuesta</th></tr>${historyRows}</table>
        </div>
        <div class="panel" style="margin-top: 20px;">
            <div class="panel__header"><h3>Crear Nuevo Ticket</h3></div>
            <form id="form-cliente-ticket" onsubmit="handleClientTicketSubmit(event)">
                <label class="form-label" for="titulo">Asunto del problema</label>
                <input type="text" id="titulo" class="form-control" required style="margin-bottom: 10px;">
                <label class="form-label" for="contenido">Descripción detallada</label>
                <textarea id="contenido" class="form-control" required rows="3" style="margin-bottom: 10px;"></textarea>
                <label class="form-label" for="adjunto">Adjuntar Evidencia (Imágenes/Videos)</label>
                <input type="file" id="adjunto" class="form-control" accept="image/*,video/*" multiple style="margin-bottom: 15px;">
                <button type="submit" id="btn-submit-ticket" class="btn btn--success">Enviar Ticket al Soporte</button>
            </form>
        </div>
    `;
}

// ==========================================
// 5. MANEJADORES DE EVENTOS Y FORMULARIOS
// ==========================================

function toggleAdminNewsModal(show) {
    const modal = document.getElementById('admin-news-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function toggleFiles(ticketId) {
    const el = document.getElementById(`files-${ticketId}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

async function handleAdminNewsSubmit(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = "Publicando...";

    const formData = new FormData();
    formData.append('titulo', document.getElementById('news-title').value.trim());
    formData.append('contenido', document.getElementById('news-content').value.trim());
    const file = document.getElementById('news-image').files[0];
    if (file) formData.append('imagen_portada', file);

    console.log("BACKEND: Procesar este FormData en /api/noticias");
    for (let pair of formData.entries()) console.log(pair[0] + ': ' + (pair[1].name || pair[1]));
    
    setTimeout(() => {
        alert("Noticia publicada correctamente (Simulación).");
        toggleAdminNewsModal(false);
        btn.disabled = false; btn.textContent = "Publicar";
        event.target.reset();
    }, 1000);
}

async function handleClientTicketSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-ticket');
    btn.disabled = true; btn.textContent = "Enviando archivos...";

    const archivos = document.getElementById('adjunto').files;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
    
    for (let i = 0; i < archivos.length; i++) {
        if (archivos[i].size > MAX_SIZE) {
            alert(`Error: El archivo ${archivos[i].name} excede los 5MB permitidos.`);
            btn.disabled = false; btn.textContent = "Enviar Ticket al Soporte";
            return;
        }
    }

    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value.trim());
    formData.append('contenido', document.getElementById('contenido').value.trim());
    formData.append('id_cliente', currentUser.id);
    for (let i = 0; i < archivos.length; i++) formData.append('archivos_adjuntos[]', archivos[i]);

    console.log("BACKEND: Procesar este FormData en /api/tickets");
    
    // Simulación de carga de red
    setTimeout(() => {
        alert("Ticket creado con éxito. El equipo de soporte ha sido notificado.");
        btn.disabled = false; btn.textContent = "Enviar Ticket al Soporte";
        event.target.reset();
        initializeDashboard('Cliente'); // Recargar vista
    }, 1500);
}