// ==========================================
// 1. ESTADO GLOBAL Y UTILIDADES DE SEGURIDAD
// ==========================================



const usuarioGuardado = localStorage.getItem('usuario');
if(!localStorage.getItem('token') || !usuarioGuardado){
    window.location.href = 'register-login.html';
}

//lectura del usuario y el token
const usuarioDB = JSON.parse(usuarioGuardado);

const currentUser = {
    id: usuarioDB.id,
    name: usuarioDB.nombre,
    role: usuarioDB.rol
};

//Estado para la gestion de archivos y paginas visitadas
let archivosSeleccionados = [];
let appState = {
    adminUsersPage: 1,
    adminNewsPage: 1,
    bossPage: 1,
    bossFilterId: "",
    workerPage: 1,
    workerFilterId: ""
};

function escapeHTML(str){
    if(str === null || str === undefined) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeRender(containerId, htmlString){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.replaceChildren();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    while(doc.body.firstChild){
        container.appendChild(doc.body.firstChild);
    }
}

function showLoader(){
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("loader--active");
}

function hideLoader(){
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("loader--active");
}

async function apiFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...(options.headers || {})
    };
    if (options.body instanceof FormData) delete headers['Content-Type'];
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = 'register-login.html';
    }
    return res;
}

// ==========================================
// 2. CONTRATO DE API
// ==========================================

const API_MOCK = {
    getClientTickets: async () => {
        const res = await apiFetch(`${API_URL}/api/tickets`);
        const data = await res.json();
        return data.tickets || [];
    },

    getUnassignedTickets: async (page = 1, filterId = "") => {
        const res = await apiFetch(`${API_URL}/api/tickets`);
        const data = await res.json();
        let tickets = data.tickets || [];
        if (filterId) tickets = tickets.filter(t => t.id.toString().includes(filterId));

        tickets = tickets.filter(t => t.estatus === 'Creado');

        if (filterId) tickets = tickets.filter(t=> t.id.toString().includes(filterId));
        const limit = 10;
        const totalPages = Math.ceil(tickets.length / limit) || 1;
        const startIndex = (page - 1) * limit;
        return { data: tickets.slice(startIndex, startIndex + limit), totalPages, currentPage: page };
    },

    getWorkerTickets: async (workerId, page = 1, filterId = "") => {
        const res = await apiFetch(`${API_URL}/api/tickets`);
        const data = await res.json();
        let tickets = data.tickets || [];
        if (filterId) tickets = tickets.filter(t => t.id.toString().includes(filterId));
        const limit = 10;
        const totalPages = Math.ceil(tickets.length / limit) || 1;
        const startIndex = (page - 1) * limit;
        return { data: tickets.slice(startIndex, startIndex + limit), totalPages, currentPage: page };
    },

    getUsers: async () => {
        const res = await apiFetch(`${API_URL}/api/auth/usuarios`);
        const data = await res.json();
        return { data: data.usuarios || [], totalPages: 1, currentPage: 1 };
    }
};

const API_NEWS = {
    getAll: async (page = 1, limit = 10) => {
        const res = await fetch(`${API_URL}/api/noticias`);
        if (!res.ok) throw new Error('Error al obtener noticias');
        const all = await res.json();
        const start = (page - 1) * limit;
        return {
            data: all.slice(start, start + limit),
            totalPages: Math.ceil(all.length / limit) || 1,
            currentPage: page
        };
    },
    create: async (formData) => {
        const res = await apiFetch(`${API_URL}/api/noticias`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
            const mensaje = Array.isArray(data.error) 
                ? data.error.map(e => e.msg).join(', ')
                : (data.error || 'Error al crear la noticia');
            throw new Error(mensaje);
        }
        return data;
    },
    delete: async (id) => {
        const res = await apiFetch(`${API_URL}/api/noticias/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar la noticia');
        return await res.json();
    },

    getNews: async (page = 1) => {
        const res = await apiFetch(`${API_URL}/api/noticias`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al eliminar la noticia');
        return data;
    }
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
    showLoader();
    safeRender("content-area", `<div class="panel" style="text-align:center; padding: 40px;"><h3>Cargando datos...</h3></div>`);

    try {
        switch(role) {
            case 'admin':
                title.textContent = "Panel de Administración";
                await loadAdminView();
                break;
            case 'jefe':
                title.textContent = "Asignación de Tickets";
                await loadBossView();
                break;
            case 'trabajador':
                title.textContent = "Tickets Asignados";
                await loadWorkerView();
                break;
            case 'cliente':
                title.textContent = "Mis Tickets";
                const clientTickets = await API_MOCK.getClientTickets(currentUser.id);
                archivosSeleccionados = [];
                safeRender("content-area", getClientTemplate(clientTickets));
                renderListaArchivos();
                break;
        }
    } catch (error) {
        console.error("Error:", error);
        hideLoader();
        safeRender("content-area", `<div class="panel"><h3 class="text-danger">Error de conexión: ${escapeHTML(error.message)}</h3></div>`);
    }
}

function renderSidebar(role) {
    safeRender("sidebar-nav", `
        <li class="sidebar__item sidebar__item--active" onclick="initializeDashboard(currentUser.role)">Dashboard</li>
        <li class="sidebar__item" onclick="cerrarSesion()">Cerrar Sesión</li>
    `);
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'register-login.html';
}

// ==========================================
// 4. FUNCIONES DE CARGA PAGINADAS
// ==========================================

async function loadAdminView() {
    const [usersRes, newsRes] = await Promise.all([
        API_MOCK.getUsers(appState.adminUsersPage),
        API_NEWS.getAll(appState.adminNewsPage)
    ]);
    safeRender("content-area", getAdminTemplate(usersRes, newsRes));
}

async function loadBossView() {
    const [ticketsRes, trabajadorRes] = await Promise.all([
        API_MOCK.getUnassignedTickets(appState.bossPage, appState.bossFilterId),
        API_MOCK.getUsers ()
    ]);

    safeRender("content-area", getBossTemplate(ticketsRes,trabajadorRes.data))
}

async function loadWorkerView() {
    const ticketsRes = await API_MOCK.getWorkerTickets(currentUser.id, appState.workerPage, appState.workerFilterId);
    safeRender("content-area", getWorkerTemplate(ticketsRes));
}

function renderPagination(currentPage, totalPages, actionFn) {
    return `
        <div class="pagination">
            <button class="btn btn--primary" onclick="${actionFn}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Anterior</button>
            <span class="pagination__info">Página ${currentPage} de ${totalPages}</span>
            <button class="btn btn--primary" onclick="${actionFn}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente &raquo;</button>
        </div>
    `;
}

// ==========================================
// 5. GENERADORES DE VISTAS (Templates)
// ==========================================

function getAdminTemplate(usersRes, newsRes) {
    hideLoader();
    const usersRows = usersRes.data.map(u => `
        <tr>
            <td>${escapeHTML(u.id)}</td>
            <td>${escapeHTML(u.nombre)}</td>
            <td>
                <select class="form-control form-control--sm">
                    <option ${u.rol === 'jefe' ? 'selected' : ''}>Jefe</option>
                    <option ${u.rol === 'trabajador' ? 'selected' : ''}>Trabajador</option>
                </select>
            </td>
            <td><button class="btn btn--success btn--sm"  onclick="actualizarRolUsuario(${u.id}, this)">Actualizar</button></td>
        </tr>
    `).join('');

    const newsRows = newsRes.data.length ? newsRes.data.map(n => `
        <tr>
            <td>${escapeHTML(n.id)}</td>
            <td>${escapeHTML(n.titulo)}</td>
            <td>${new Date(n.created_at).toLocaleDateString('es-ES')}</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteNews(${n.id})">Borrar</button></td>
        </tr>
    `).join('') : `<tr><td colspan="4">No hay noticias publicadas.</td></tr>`;

    return `
        <div class="grid-layout-2col">
            <div class="panel">
                <h3>Gestión de Usuarios</h3>
                <table class="table">
                    <tr><th>ID</th><th>Nombre</th><th>Rol</th><th>Acción</th></tr>
                    ${usersRows}
                </table>
                ${renderPagination(usersRes.currentPage, usersRes.totalPages, 'changeAdminUsersPage')}
            </div>

            <div class="panel">
                <div class="panel__header">
                    <h3>Gestión de Noticias</h3>
                    <button class="btn btn--primary" onclick="toggleAdminNewsModal(true)">+ Publicar</button>
                </div>
                <table class="table">
                    <tr><th>ID</th><th>Título</th><th>Fecha</th><th>Acción</th></tr>
                    ${newsRows}
                </table>
                ${renderPagination(newsRes.currentPage, newsRes.totalPages, 'changeAdminNewsPage')}
            </div>
        </div>

        <div id="admin-news-modal" class="modal-overlay" style="display:none;">
            <div class="modal">
                <div class="modal__header">
                    <h3 class="modal__title">Nueva Noticia</h3>
                    <button class="modal__close" onclick="toggleAdminNewsModal(false)">×</button>
                </div>
                <form id="form-admin-news" onsubmit="handleAdminNewsSubmit(event)">
                    <div class="form-group">
                        <label class="form-label">Título</label>
                        <input type="text" id="news-title" class="form-control" required minlength="5" maxlength="255">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría</label>
                        <select id="news-category" class="form-control" required>
                            <option value="" disabled selected>Seleccione una categoría</option>
                            <option value="Ciberseguridad">Ciberseguridad</option>
                            <option value="Herramientas">Herramientas</option>
                            <option value="DesarrolloWeb">Desarrollo Web</option>
                            <option value="IngenieriaSocial">Ingeniería Social</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Imagen (opcional)</label>
                        <input type="file" id="news-image" class="form-control" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contenido</label>
                        <textarea id="news-content" class="form-control" required minlength="10"></textarea>
                    </div>
                    <p id="news-error" class="text-danger" style="display:none;"></p>
                    <div class="modal__actions">
                        <button type="button" class="btn btn--danger" onclick="toggleAdminNewsModal(false)">Cancelar</button>
                        <button type="submit" class="btn btn--success">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getBossTemplate(ticketsRes, trabajadores = []) {
    hideLoader();
    const opcionesTrabajadores = trabajadores
        .filter(t => t.rol === 'trabajador')
        .map(t => `<option value="${escapeHTML(t.id)}">${escapeHTML(t.nombre)}</option>`)
        .join('');
    
    
    const rows = ticketsRes.data.length ? ticketsRes.data.map(t => `
        
        <tr>
            <td>#${escapeHTML(t.id)}</td>
            <td>${escapeHTML(t.titulo)}</td>
            <td>
                <select class="form-control form-control--sm" id="boss-assign-${escapeHTML(t.id)}">
                    <option value="" disabled selected>-- Asignar a --</option>
                    ${opcionesTrabajadores}
                </select>
            </td>
            <td>
                <div class="table__actions">
                    <button class="btn btn--success btn--sm" onclick="asignarTicket(${escapeHTML(t.id)}, this)">Asignar</button>
                    <button class="btn btn--primary btn--sm" onclick='viewTicketDetailBoss(${JSON.stringify(t)})'>Detalles</button>
                </div>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="4">No hay tickets pendientes.</td></tr>`;

    return `
        <div class="panel">
            <div class="panel__header panel__header--wrap">
                <h3>Tickets Pendientes de Asignación</h3>
                <div>
                    <input type="text" id="boss-filter" class="form-control form-control--search" placeholder="Filtrar por ID..."
                           value="${appState.bossFilterId}"
                           oninput="handleBossFilter(this.value)">
                </div>
            </div>
            <table class="table">
                <tr><th>ID</th><th>Título</th><th>Trabajador</th><th>Acciones</th></tr>
                ${rows}
            </table>
            ${renderPagination(ticketsRes.currentPage, ticketsRes.totalPages, 'changeBossPage')}
        </div>
    `;
}

function getWorkerTemplate(ticketsRes) {
    hideLoader();
    const rows = ticketsRes.data.length ? ticketsRes.data.map(t => {
        return `
            <tr>
                <td>#${escapeHTML(t.id)}</td>
                <td>${escapeHTML(t.titulo)}</td>
                <td>
                    <select class="form-control form-control--sm">
                        <option value="Asignado" ${t.estatus === 'Asignado' ? 'selected' : ''}>Asignado</option>
                        <option value="En_progreso" ${t.estatus === 'En progreso' ? 'selected' : ''}>En progreso</option>
                        <option value="Cerrado" ${t.estatus === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                    </select>
                </td>
                <td>
                    <div class="table__actions">
                        <button class="btn btn--success btn--sm" onclick="guardarEstatus(${escapeHTML(t.id)}, this)">Guardar</button> 
                        <button class="btn btn--primary btn--sm" onclick='openTicketDetail(${JSON.stringify(t)})'>Ver Detalles</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('') : `<tr><td colspan="4">No hay tareas asignadas.</td></tr>`;

    return `
        <div class="panel">
            <div class="panel__header panel__header--wrap">
                <h3>Mis Tareas Activas</h3>
                <div>
                    <input type="text" id="worker-filter" class="form-control form-control--search" placeholder="Filtrar por ID..."
                           value="${appState.workerFilterId}"
                           oninput="handleWorkerFilter(this.value)">
                </div>
            </div>
            <table class="table">
                <tr><th>ID</th><th>Título</th><th>Estatus</th><th>Acciones</th></tr>
                ${rows}
            </table>
            ${renderPagination(ticketsRes.currentPage, ticketsRes.totalPages, 'changeWorkerPage')}
        </div>
    `;
}

function getClientTemplate(tickets) {
    hideLoader();
    const historyRows = tickets.length ? tickets.map(t => `
        <tr>
            <td>#${escapeHTML(t.id)}</td>
            <td>${escapeHTML(t.titulo)}</td>
            <td><strong>${escapeHTML(t.estatus)}</strong></td>
            <td>
                <button class="btn btn--primary btn--sm" onclick='viewTicketDetailClient(${JSON.stringify(t)})'>Ver Detalles</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="4">No hay tickets en tu historial.</td></tr>`;

    return `
        <div class="grid-layout-2col">
            <div class="panel">
                <div class="panel__header"><h3>Historial de Tickets</h3></div>
                <table class="table">
                    <tr><th>ID</th><th>Título</th><th>Estatus</th><th>Acción</th></tr>
                    ${historyRows}
                </table>
            </div>

            <div class="ticket-usr__form panel">
                <form id="form-cliente-ticket" onsubmit="handlePreSubmitTicket(event)">
                    <legend>Crear un ticket</legend>
                    <label for="titulo">Titulo</label>
                    <input type="text" id="titulo" class="form-control" required placeholder="Introduzca un titulo">

                    <label for="contenido">Contenido</label>
                    <textarea id="contenido" class="form-control" required placeholder="Describa su problema en detalle" rows="3"></textarea>

                    <label for="adjunto" class="add__file">Adjuntar archivo</label>
                    <input type="file" id="adjunto" class="form-control" accept="image/*,video/*" multiple onchange="handleFileSelect(this)">

                    <ul id="adjunto-lista" style="margin: 10px 0; list-style: none; padding: 0;"></ul>

                    <button type="submit" class="btn btn--success btn--full">Enviar ticket</button>
                </form>
            </div>
        </div>

        <div id="modal-overlay" class="modal-overlay" style="display: none;">
            <div class="modal layout-center-md" style="text-align: center;">
                <p>¿Estás seguro de que quieres enviar el ticket?</p>
                <div class="modal__actions" style="justify-content: center;">
                    <button type="button" class="btn btn--danger" onclick="closeConfirmModal()">Cancelar</button>
                    <button type="button" class="btn btn--success" onclick="processClientTicketSubmit()">Enviar</button>
                </div>
            </div>
        </div>
    `;
}

function getGenericTicketDetailTemplate(ticket, returnRole) {
    const notasInternasHTML = returnRole === 'jefe' ? `
        <div class="panel" style="background: #fff3cd; border-color: #ffeeba; margin-top: 20px;">
            <h4 style="color: #856404; margin-bottom: 10px;">Notas Internas (Solo Personal):</h4>
            <p style="white-space: pre-wrap;">
                ${ticket.notasInternas ? escapeHTML(ticket.notasInternas) : "<em>No hay notas internas registradas en este ticket.</em>"}
            </p>
        </div>
    ` : '';

    
    const infoClienteHTML = returnRole !== 'cliente' ? `<p><strong>Cliente:</strong> ${escapeHTML(ticket.autor_nombre || 'Desconocido')}</p>` : '';

    return `
        <div class="panel layout-center-md">
            <div class="panel__header">
                <h3>Ticket #${escapeHTML(ticket.id)}: ${escapeHTML(ticket.titulo)}</h3>
                <button class="btn btn--danger" onclick="initializeDashboard('${returnRole}')">Volver</button>
            </div>

            <div class="panel" style="background: #fdfdfd;">
                <p><strong>Estatus:</strong> <span class="badge">${escapeHTML(ticket.estatus)}</span></p>
                ${infoClienteHTML}
                <h4 style="margin-top: 15px;">Mensaje Original:</h4>
                <p class="form-control" style="white-space: pre-wrap; background: var(--color-white);">
                    ${escapeHTML(ticket.contenido || "Sin descripción proporcionada.")}
                </p>
            </div>

            <div class="panel" style="background: #e6f2ff; border-color: #cce5ff;">
                <h4 style="color: #004085; margin-bottom: 10px;">Respuesta Oficial / Pública:</h4>
                <p style="white-space: pre-wrap;">
                    ${ticket.respuestaPublica ? escapeHTML(ticket.respuestaPublica) : "<em>Aún no hay una resolución oficial publicada para el cliente.</em>"}
                </p>
            </div>

            ${notasInternasHTML}
        </div>
    `;
}

function getWorkerTicketDetailTemplate(ticket) {
    return `
        <div class="panel layout-center-md">
            <div class="panel__header">
                <h3>Gestionando Ticket #${escapeHTML(ticket.id)}</h3>
                <button class="btn btn--danger" onclick="initializeDashboard('trabajador')">Volver al Listado</button>
            </div>

            <div class="panel" style="background: #fdfdfd; margin-bottom: 20px;">
                <p><strong>Titulo:</strong> ${escapeHTML(ticket.titulo)}</p>
                <p><strong>Cliente:</strong> ${escapeHTML(ticket.autor_nombre || 'Desconocido')}</p>
                <h4 style="margin-top: 15px;">Descripción del Problema:</h4>
                <p class="form-control" style="white-space: pre-wrap; background: var(--color-white);">
                    ${escapeHTML(ticket.contenido || "El cliente no proporcionó una descripción adicional.")}
                </p>
            </div>

            <form id="form-respuesta-publica" onsubmit="handlePublicResponseSubmit(event, ${ticket.id})" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border);">
                <div class="form-group">
                    <label class="form-label"><strong>Respuesta al cliente (Pública)</strong></label>
                    <textarea id="respuesta-publica" class="form-control" rows="3" placeholder="El usuario verá este mensaje..."></textarea>
                </div>
                <button type="submit" class="btn btn--success">Enviar Respuesta Pública</button>
            </form>

            <form id="form-notas-internas" onsubmit="handleInternalNoteSubmit(event, ${ticket.id})">
                <div class="form-group">
                    <label class="form-label"><strong>Notas internas (Solo Personal)</strong></label>
                    <textarea id="notas-internas" class="form-control" rows="3" placeholder="Detalles técnicos y pasos realizados..."></textarea>
                </div>
                <button type="submit" class="btn btn--primary">Guardar Nota Interna</button>
            </form>
        </div>
    `;
}

// ==========================================
// 6. CONTROLADORES DE EVENTOS Y PAGINACIÓN
// ==========================================

function changeAdminUsersPage(newPage) { appState.adminUsersPage = newPage; loadAdminView(); }
function changeAdminNewsPage(newPage)  { appState.adminNewsPage  = newPage; loadAdminView(); }

let bossFilterTimeout;
function handleBossFilter(value) {
    clearTimeout(bossFilterTimeout);
    bossFilterTimeout = setTimeout(() => {
        appState.bossFilterId = value.trim();
        appState.bossPage = 1;
        loadBossView();
    }, 400);
}
function changeBossPage(newPage) { appState.bossPage = newPage; loadBossView(); }

let workerFilterTimeout;
function handleWorkerFilter(value) {
    clearTimeout(workerFilterTimeout);
    workerFilterTimeout = setTimeout(() => {
        appState.workerFilterId = value.trim();
        appState.workerPage = 1;
        loadWorkerView();
    }, 400);
}
function changeWorkerPage(newPage) { appState.workerPage = newPage; loadWorkerView(); }

function openTicketDetail(ticket)       { safeRender("content-area", getWorkerTicketDetailTemplate(ticket)); }
function viewTicketDetailClient(ticket) { safeRender("content-area", getGenericTicketDetailTemplate(ticket, 'cliente')); }
function viewTicketDetailBoss(ticket)   { safeRender("content-area", getGenericTicketDetailTemplate(ticket, 'jefe')); }

function handleFileSelect(input) {
    const MAX_ARCHIVOS   = 3;
    const MAX_PESO_BYTES = 50 * 1024 * 1024;
    const nuevosArchivos = Array.from(input.files);

    for (let file of nuevosArchivos) {
        if (archivosSeleccionados.length >= MAX_ARCHIVOS) {
            alert(`Has alcanzado el límite máximo de ${MAX_ARCHIVOS} archivos adjuntos.`);
            break;
        }
        if (file.size > MAX_PESO_BYTES) {
            alert(`El archivo "${file.name}" supera el límite permitido de 50MB.`);
            continue;
        }
        archivosSeleccionados.push(file);
    }
    renderListaArchivos();
    input.value = "";
}

function renderListaArchivos() {
    const lista = document.getElementById('adjunto-lista');
    if (!lista) return;
    lista.innerHTML = archivosSeleccionados.length === 0
        ? '<li class="text-muted">Ningún archivo seleccionado</li>'
        : archivosSeleccionados.map((file, index) => `
            <li class="file-list__item">
                <span>${escapeHTML(file.name)}</span>
                <button type="button" class="btn-icon text-danger" onclick="eliminarArchivo(${index})">✕</button>
            </li>`).join('');
}

function eliminarArchivo(index) { archivosSeleccionados.splice(index, 1); renderListaArchivos(); }

function handlePreSubmitTicket(event) {
    event.preventDefault();
    const titulo    = document.getElementById('titulo').value.trim();
    const contenido = document.getElementById('contenido').value.trim();
    if (titulo === "" || contenido === "") {
        alert("Por favor, rellena tanto el título como el contenido. No pueden estar vacíos ni contener solo espacios.");
        return;
    }
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeConfirmModal() { document.getElementById('modal-overlay').style.display = 'none'; }

async function processClientTicketSubmit() {
    closeConfirmModal();
    const btn = document.querySelector('#form-cliente-ticket button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Enviando...";
    try {
        const titulo    = document.getElementById('titulo').value.trim();
        const contenido = document.getElementById('contenido').value.trim();

        const res = await apiFetch(`${API_URL}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, contenido })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Error: ${data.error}`);
            btn.disabled = false;
            btn.textContent = "Enviar Ticket";
            return;
        }

        for (const file of archivosSeleccionados) {
            const formData = new FormData();
            formData.append('archivo', file);
            await apiFetch(`${API_URL}/api/tickets/${data.ticketId}/adjuntos`, {
                method: 'POST',
                body: formData
            });
        }

        alert('Ticket creado');
        initializeDashboard('cliente');
    } catch(err) {
        console.error('Error:', err);
        alert('No se pudo conectar con el servidor.');
        btn.disabled = false;
        btn.textContent = "Enviar ticket";
    }
}

// ----- CONTROLADORES DE RESOLUCIÓN INDEPENDIENTES ----- //

async function handlePublicResponseSubmit(event, ticketId) {
    event.preventDefault();
    const respuestaPublica = document.getElementById('respuesta-publica').value.trim();
    if (respuestaPublica === "") {
        alert("La respuesta al cliente (pública) no puede estar vacía.");
        return;
    }
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Enviando Respuesta...";
    try {
        const res = await apiFetch(`${API_URL}/api/tickets/${ticketId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comentario: respuestaPublica })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Respuesta enviada correctamente.');
        }
    } catch(err) {
        alert('No se pudo conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar Respuesta Pública';
    }
}

async function handleInternalNoteSubmit(event, ticketId) {
    event.preventDefault();
    const notasInternas = document.getElementById('notas-internas').value.trim();
    if (notasInternas === "") {
        alert("La nota interna no puede estar vacía.");
        return;
    }
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Guardando Nota...";
    try {
        const res = await apiFetch(`${API_URL}/api/tickets/${ticketId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comentario: notasInternas })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Nota interna guardada correctamente.');
        }
    } catch(err) {
        alert('No se pudo conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Nota Interna';
    }
}

// ==========================================
// 7. GESTIÓN DE NOTICIAS (REAL API)
// ==========================================

function toggleAdminNewsModal(show) {
    const modal = document.getElementById("admin-news-modal");
    if (modal) modal.style.display = show ? "flex" : "none";
    if (!show) {
        const form = document.getElementById("form-admin-news");
        if (form) form.reset();
        const err = document.getElementById("news-error");
        if (err) err.style.display = "none";
    }
}

async function handleAdminNewsSubmit(event) {
    event.preventDefault();
    const btn         = event.target.querySelector("button[type='submit']");
    const errorEl     = document.getElementById("news-error");
    const imagenInput = document.getElementById("news-image");

    errorEl.style.display = "none";

    if (imagenInput.files.length > 1) {
        errorEl.textContent = "Solo se permite subir 1 imagen por noticia.";
        errorEl.style.display = "block";
        return;
    }

    const titulo    = document.getElementById("news-title").value.trim();
    const categoria = document.getElementById("news-category").value;
    const contenido = document.getElementById("news-content").value.trim();
    const imagen    = imagenInput.files[0];

    if (titulo.length < 5) {
        errorEl.textContent = "El título debe tener al menos 5 caracteres.";
        errorEl.style.display = "block";
        return;
    }
    if (contenido.length < 10) {
        errorEl.textContent = "El contenido debe tener al menos 10 caracteres.";
        errorEl.style.display = "block";
        return;
    }
    if (!categoria) {
        errorEl.textContent = "La categoría es obligatoria.";
        errorEl.style.display = "block";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Publicando...";

    const formData = new FormData();
    formData.append("titulo",    titulo);
    formData.append("categoria", categoria);
    formData.append("contenido", contenido);
    if (imagen) formData.append("imagen", imagen);

    try {
        await API_NEWS.create(formData);
        alert("Noticia publicada correctamente.");
        toggleAdminNewsModal(false);
        appState.adminNewsPage = 1;
        await loadAdminView();
    } catch (err) {
        const mensaje = Array.isArray(err.message) 
        ? err.message.map(e => e.msg).join('\n')
        : err.message;
    errorEl.textContent = mensaje;
    errorEl.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.textContent = "Publicar";
    }
}

async function deleteNews(id) {
    if (!confirm("¿Eliminar esta noticia?")) return;
    try {
        await API_NEWS.delete(id);
        alert("Noticia eliminada correctamente.");
        await loadAdminView();
    } catch (err) {
        alert("Error al eliminar: " + err.message);
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'register-login.html';
}

async function actualizarRolUsuario(userId,btn) {
    const select = btn.closest('tr').querySelector('select');
    const nuevoRol = select.value.toLowerCase();

    btn.disabled=true;
    btn.textContent= 'Guardando';

    try{
        const res = await apiFetch(`${API_URL}/api/auth/usuarios/${userId}/rol`,{
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify({rol: nuevoRol})
        });

        const data = await res.json();

        if (!res.ok){
            alert(`Error: ${data.error}`);
        }else{
            alert(data.mensaje);
        }
    }catch(err){
        alert('No se pudo conectar con el servidor')
    }
    
    btn.disabled = false;
    btn.textContent= 'Actualizar';
}

async function asignarTicket(ticketId, btn) {
    const select = document.getElementById(`boss-assign-${ticketId}`);
    const trabajadorId = select.value;

    if (!trabajadorId) {
        alert('Selecciona un trabajador primero.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Asignando...';

    try {
        const res = await apiFetch(`${API_URL}/api/tickets/${ticketId}/asignar`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify({ trabajador_id: parseInt(trabajadorId) })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Error: ${data.error}`);
        } else {
            alert(data.mensaje);
            loadBossView();
        }
    } catch (err) {
        alert('No se pudo conectar con el servidor.');
    }

    btn.disabled = false;
    btn.textContent = 'Asignar';
}

async function guardarEstatus(ticketId,btn) {
    const select = btn.closest('tr').querySelector('select');
    const nuevoEstatus = select.value;

    btn.disabled=true;
    btn.textContent= 'Guardando...';

    try{
        const res = await apiFetch(`${API_URL}/api/tickets/${ticketId}/estatus`,{
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify({estatus: nuevoEstatus})
        });

        const data = await res.json();

        if(!res.ok){
            alert(`Error: ${data.error}`);
        }else{
            alert(data.mensaje);
            loadWorkerView();
        }
    }catch(err){
        alert('No se pudo conectar al servidor')
    }

    btn.disabled = false
    btn.textContent = 'Guardar'
}

