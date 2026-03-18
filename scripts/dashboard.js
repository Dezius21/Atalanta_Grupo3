// ==========================================
// 1. ESTADO GLOBAL Y UTILIDADES DE SEGURIDAD
// ==========================================
const currentUser = { id: 102, name: "Esther Howard", role: "cliente" }; 

// Estado para la gestión de archivos y vistas paginadas
let archivosSeleccionados = [];
let appState = {
    adminUsersPage: 1,
    adminNewsPage: 1,
    bossPage: 1,
    bossFilterId: "",
    workerPage: 1,
    workerFilterId: ""
};

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

function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("loader--active");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("loader--active");
}

// ==========================================
// 2. CONTRATO DE API (Mock DB Paginada)
// ==========================================

const DB_MOCK = {
    users: Array.from({length: 25}, (_, i) => ({ id: 100+i, name: `Usuario ${i+1}`, role: i%3===0?'jefe':'trabajador' })),
    news: Array.from({length: 22}, (_, i) => ({ id: i+1, title: `Noticia ${i+1}`, date: "18 Mar 2026", author: "Admin" })),
    
    // Se ha añadido la propiedad "cliente" a todos los arrays de tickets
    unassignedTickets: Array.from({length: 35}, (_, i) => ({ id: 300+i, asunto: `Error en módulo ${i+1}`, cliente: "Cliente Anónimo", contenido: "La pantalla se queda en negro.", estado: "Creado", notasInternas: i%2===0 ? "El cliente intentó hacer login 5 veces." : "", respuestaPublica: i%3===0 ? "Estamos revisando su caso." : "" })),
    workerTickets: Array.from({length: 28}, (_, i) => ({ id: 400+i, asunto: `Tarea de soporte ${i+1}`, cliente: `Empresa ${i+1}`, estado: i%2===0?"Asignado":"En progreso", contenido: "Revisar logs del sistema.", archivos: [] })),
    clientTickets: Array.from({length: 5}, (_, i) => ({ id: 500+i, asunto: `Mi Ticket ${i+1}`, cliente: currentUser.name, estado: "Resuelto", contenido: "Fallo al iniciar sesión", respuestaPublica: "Caché limpiada." }))
};

function paginateData(array, page, limit = 10, filterId = "") {
    let filtered = filterId ? array.filter(item => item.id.toString().includes(filterId)) : array;
    const startIndex = (page - 1) * limit;
    return {
        data: filtered.slice(startIndex, startIndex + limit),
        totalPages: Math.ceil(filtered.length / limit) || 1,
        currentPage: page
    };
}

const API_MOCK = {
    getUsers: async (page = 1) => new Promise(res => setTimeout(() => res(paginateData(DB_MOCK.users, page)), 300)),
    getNews: async (page = 1) => new Promise(res => setTimeout(() => res(paginateData(DB_MOCK.news, page)), 300)),
    getUnassignedTickets: async (page = 1, filterId = "") => new Promise(res => setTimeout(() => res(paginateData(DB_MOCK.unassignedTickets, page, 10, filterId)), 400)),
    getWorkerTickets: async (workerId, page = 1, filterId = "") => new Promise(res => setTimeout(() => res(paginateData(DB_MOCK.workerTickets, page, 10, filterId)), 400)),
    getClientTickets: async (clientId) => new Promise(res => setTimeout(() => res(DB_MOCK.clientTickets), 300))
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
        safeRender("content-area", `<div class="panel"><h3 class="text-danger">Error de conexión.</h3></div>`);
    }
}

function renderSidebar(role) {
    safeRender("sidebar-nav", `
        <li class="sidebar__item sidebar__item--active" onclick="initializeDashboard(currentUser.role)">Dashboard</li>
        <li class="sidebar__item">Cerrar Sesión</li>
    `);
}

// ==========================================
// 4. FUNCIONES DE CARGA PAGINADAS
// ==========================================

async function loadAdminView() {
    const [usersRes, newsRes] = await Promise.all([
        API_MOCK.getUsers(appState.adminUsersPage), 
        API_MOCK.getNews(appState.adminNewsPage)
    ]);
    safeRender("content-area", getAdminTemplate(usersRes, newsRes));
}

async function loadBossView() {
    const ticketsRes = await API_MOCK.getUnassignedTickets(appState.bossPage, appState.bossFilterId);
    safeRender("content-area", getBossTemplate(ticketsRes));
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
            <td>${escapeHTML(u.name)}</td>
            <td>
                <select class="form-control form-control--sm">
                    <option ${u.role === 'jefe' ? 'selected' : ''}>Jefe</option>
                    <option ${u.role === 'trabajador' ? 'selected' : ''}>Trabajador</option>
                </select>
            </td>
            <td><button class="btn btn--success btn--sm">Actualizar</button></td>
        </tr>
    `).join('');

    const newsRows = newsRes.data.map(n => `
        <tr>
            <td>${escapeHTML(n.id)}</td>
            <td>${escapeHTML(n.title)}</td>
            <td>${escapeHTML(n.date)}</td>
            <td><button class="btn btn--danger btn--sm" onclick="deleteNews(${n.id})">Borrar</button></td>
        </tr>
    `).join('');

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
                    <div class="form-group"><label class="form-label">Título</label><input type="text" id="news-title" class="form-control" required></div>
                    
                    <div class="form-group">
                        <label class="form-label">Imagen</label>
                        <input type="file" id="news-image" class="form-control" accept="image/*">
                    </div>

                    <div class="form-group"><label class="form-label">Contenido</label><textarea id="news-content" class="form-control" required></textarea></div>
                    <div class="modal__actions">
                        <button type="button" class="btn btn--danger" onclick="toggleAdminNewsModal(false)">Cancelar</button>
                        <button type="submit" class="btn btn--success">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getBossTemplate(ticketsRes) {
    hideLoader();
    const rows = ticketsRes.data.length ? ticketsRes.data.map(t => `
        <tr>
            <td>#${escapeHTML(t.id)}</td>
            <td>${escapeHTML(t.asunto)}</td>
            <td>
                <select class="form-control form-control--sm" id="boss-assign-${escapeHTML(t.id)}">
                    <option value="" disabled selected>-- Asignar a --</option>
                    <option value="101">Cody Fisher</option>
                </select>
            </td>
            <td>
                <div class="table__actions">
                    <button class="btn btn--success btn--sm" onclick="alert('Ticket Asignado')">Asignar</button>
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
                <tr><th>ID</th><th>Asunto</th><th>Trabajador</th><th>Acciones</th></tr>
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
                <td>${escapeHTML(t.asunto)}</td>
                <td>
                    <select class="form-control form-control--sm">
                        <option value="Asignado" ${t.estado === 'Asignado' ? 'selected' : ''}>Asignado</option>
                        <option value="En progreso" ${t.estado === 'En progreso' ? 'selected' : ''}>En progreso</option>
                        <option value="Resuelto" ${t.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>
                    <div class="table__actions">
                        <button class="btn btn--success btn--sm">Guardar</button> 
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
                <tr><th>ID</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr>
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
            <td>${escapeHTML(t.asunto)}</td>
            <td><strong>${escapeHTML(t.estado)}</strong></td>
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
                    <tr><th>ID</th><th>Asunto</th><th>Estado</th><th>Acción</th></tr>
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

    // Condicionamos que el nombre del cliente se muestre a todo el mundo menos al propio cliente
    const infoClienteHTML = returnRole !== 'cliente' ? `<p><strong>Cliente:</strong> ${escapeHTML(ticket.cliente || 'Desconocido')}</p>` : '';

    return `
        <div class="panel layout-center-md">
            <div class="panel__header">
                <h3>Ticket #${escapeHTML(ticket.id)}: ${escapeHTML(ticket.asunto)}</h3>
                <button class="btn btn--danger" onclick="initializeDashboard('${returnRole}')">Volver</button>
            </div>
            
            <div class="panel" style="background: #fdfdfd;">
                <p><strong>Estado:</strong> <span class="badge">${escapeHTML(ticket.estado)}</span></p>
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
                <p><strong>Asunto:</strong> ${escapeHTML(ticket.asunto)}</p>
                <p><strong>Cliente:</strong> ${escapeHTML(ticket.cliente || 'Desconocido')}</p>
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
function changeAdminNewsPage(newPage) { appState.adminNewsPage = newPage; loadAdminView(); }

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

function openTicketDetail(ticket) { safeRender("content-area", getWorkerTicketDetailTemplate(ticket)); }
function viewTicketDetailClient(ticket) { safeRender("content-area", getGenericTicketDetailTemplate(ticket, 'cliente')); }
function viewTicketDetailBoss(ticket) { safeRender("content-area", getGenericTicketDetailTemplate(ticket, 'jefe')); }

function handleFileSelect(input) {
    const MAX_ARCHIVOS = 3;
    const MAX_PESO_MB = 50;
    const MAX_PESO_BYTES = MAX_PESO_MB * 1024 * 1024; // Convertir MB a Bytes

    const nuevosArchivos = Array.from(input.files);

    for (let file of nuevosArchivos) {
        if (archivosSeleccionados.length >= MAX_ARCHIVOS) {
            alert(`Has alcanzado el límite máximo de ${MAX_ARCHIVOS} archivos adjuntos.`);
            break;
        }

        if (file.size > MAX_PESO_BYTES) {
            alert(`El archivo "${file.name}" supera el límite permitido de ${MAX_PESO_MB}MB.`);
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

    const titulo = document.getElementById('titulo').value.trim();
    const contenido = document.getElementById('contenido').value.trim();

    if (titulo === "" || contenido === "") {
        alert("Por favor, rellena tanto el título como el contenido. No pueden estar vacíos ni contener solo espacios.");
        return; 
    }

    if (DB_MOCK.clientTickets.length >= 5) {
        alert("Has alcanzado el límite máximo de 5 tickets activos. Por favor, espera a que se resuelva alguno antes de abrir uno nuevo.");
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
    
    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value.trim());
    formData.append('contenido', document.getElementById('contenido').value.trim());
    formData.append('id_cliente', currentUser.id);
    archivosSeleccionados.forEach(file => {
        formData.append('archivos_adjuntos[]', file);
    });
    console.log("BACKEND: Enviando Ticket...", [...formData]);

    setTimeout(() => {
        alert("Ticket creado con éxito.");
        initializeDashboard('cliente'); 
    }, 1000);
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

    console.log(`BACKEND: Guardando respuesta pública para ticket ${ticketId}`, {
        respuestaPublica: respuestaPublica
    });

    setTimeout(() => {
        alert(`Respuesta pública del Ticket #${ticketId} enviada correctamente.`);
        btn.disabled = false;
        btn.textContent = "Enviar Respuesta Pública";
    }, 1000);
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

    console.log(`BACKEND: Guardando nota interna para ticket ${ticketId}`, {
        notasInternas: notasInternas
    });

    setTimeout(() => {
        alert(`Nota interna del Ticket #${ticketId} guardada correctamente.`);
        btn.disabled = false;
        btn.textContent = "Guardar Nota Interna";
    }, 1000);
}

// ----- FIN CONTROLADORES RESOLUCIÓN ----- //

function toggleAdminNewsModal(show) { document.getElementById("admin-news-modal").style.display = show ? "flex" : "none"; }

async function handleAdminNewsSubmit(event) {
    event.preventDefault();
    const btn = event.target.querySelector("button[type='submit']");
    const newsImageInput = document.getElementById("news-image");

    if (newsImageInput.files.length > 1) {
        alert("Solo se permite subir 1 imagen por noticia.");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Publicando...";

    const titulo = document.getElementById("news-title").value.trim();
    const contenido = document.getElementById("news-content").value.trim();
    const imagen = newsImageInput.files[0];

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("contenido", contenido);
    if (imagen) formData.append("imagen", imagen);
    
    console.log("BACKEND: enviar noticia", [...formData]);

    setTimeout(() => {
        alert("Noticia publicada");
        toggleAdminNewsModal(false);
        btn.disabled = false;
        btn.textContent = "Publicar";
        event.target.reset();
        initializeDashboard('admin'); 
    }, 800);
}

function deleteNews(id) {
    if (!confirm("¿Eliminar esta noticia?")) return;
    setTimeout(() => { alert("Noticia eliminada"); loadAdminView(); }, 500);
}