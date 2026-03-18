// ==========================================
// 1. ESTADO GLOBAL Y UTILIDADES DE SEGURIDAD
// ==========================================
const currentUser = { id: 102, name: "Esther Howard", role: "admin" }; 

// Estado para la gestión de archivos del formulario de cliente
let archivosSeleccionados = [];

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
// 2. CONTRATO DE API (Mock)
// ==========================================
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
    safeRender("content-area", `<div class="panel" style="text-align:center; padding: 40px;"><h3>Conectando con el servidor...</h3></div>`);

    try {
        switch(role) {
            case 'admin':
                hideLoader()
                title.textContent = "Panel de Administración";
                const [users, news] = await Promise.all([API_MOCK.getUsers(), API_MOCK.getNews()]);
                safeRender("content-area", getAdminTemplate(users, news));
                break;
            case 'jefe':
                hideLoader()
                title.textContent = "Asignación de Tickets";
                const unassigned = await API_MOCK.getUnassignedTickets();
                safeRender("content-area", getBossTemplate(unassigned));
                break;
            case 'trabajador':
                hideLoader()
                title.textContent = "Tickets Asignados";
                const workerTickets = await API_MOCK.getWorkerTickets(currentUser.id);
                safeRender("content-area", getWorkerTemplate(workerTickets));
                break;
            case 'cliente':
                hideLoader()
                title.textContent = "Mis Tickets";
                const clientTickets = await API_MOCK.getClientTickets(currentUser.id);
                archivosSeleccionados = []; // Reset archivos al cargar
                safeRender("content-area", getClientTemplate(clientTickets));
                renderListaArchivos(); // Inicializar lista vacía
                break;
        }
    } catch (error) {
        console.error("Error:", error);
        safeRender("content-area", `<div class="panel"><h3 style="color: red;">Error de conexión.</h3></div>`);
    }
}

function renderSidebar(role) {
    safeRender("sidebar-nav", `
        <li class="sidebar__item sidebar__item--active">Dashboard</li>
        <li class="sidebar__item">Cerrar Sesión</li>
    `);
}

// ==========================================
// 4. GENERADORES DE VISTAS (Templates)
// ==========================================

function getAdminTemplate(users, news) {
    const usersRows = users.map(u => `
        <tr>
            <td>${escapeHTML(u.id)}</td>
            <td>${escapeHTML(u.name)}</td>
            <td>
                <select class="form-control">
                    <option ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option ${u.role === 'jefe' ? 'selected' : ''}>Jefe</option>
                    <option ${u.role === 'trabajador' ? 'selected' : ''}>Trabajador</option>
                </select>
            </td>
            <td><button class="btn btn--success">Actualizar</button></td>
        </tr>
    `).join('');

    const newsRows = news.map(n => `
        <tr>
            <td>${escapeHTML(n.title)}</td>
            <td>${escapeHTML(n.date)}</td>
            <td>${escapeHTML(n.author)}</td>
            <td>
                <button class="btn btn--danger" onclick="deleteNews(${n.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    return `
        <div class="panel">
            <h3>Gestión de Usuarios</h3>
            <table class="table">${usersRows}</table>
        </div>

        <div class="panel">
            <div class="panel__header">
                <h3>Gestión de Noticias</h3>
                <button class="btn btn--primary" onclick="toggleAdminNewsModal(true)">
                    Publicar Noticia
                </button>
            </div>

            <table class="table">
                <tr>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Autor</th>
                    <th>Acción</th>
                </tr>
                ${newsRows}
            </table>
        </div>

        <!-- MODAL -->
        <div id="admin-news-modal" class="modal-overlay" style="display:none;">
            <div class="modal">
                <div class="modal__header">
                    <h3 class="modal__title">Nueva Noticia</h3>
                    <button class="modal__close" onclick="toggleAdminNewsModal(false)">×</button>
                </div>

                <form id="form-admin-news" onsubmit="handleAdminNewsSubmit(event)">
                    <div class="form-group">
                        <label class="form-label">Título</label>
                        <input type="text" id="news-title" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Imagen</label>
                        <input type="file" id="news-image" class="form-control">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Contenido</label>
                        <textarea id="news-content" class="form-control" required></textarea>
                    </div>

                    <div class="modal__actions">
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
                        <option value="Asignado" ${t.estado === 'Cread' ? 'selected' : ''}>Creado</option>
                        <option value="Asignado" ${t.estado === 'Asignado' ? 'selected' : ''}>Asignado</option>
                        <option value="En progreso" ${t.estado === 'En progreso' ? 'selected' : ''}>En progreso</option>
                        <option value="Resuelto" ${t.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>${filesHTML}</td>
                <td style="vertical-align: center;"><button class="btn btn--success">Guardar</button> <button id="open-ticket" class="btn btn--primary" onclick='openTicketDetail(${JSON.stringify(t)})'>Abrir ticket</button></td>
            </tr>
        `;
    }).join('');
    return `<div class="panel">
                <div class="panel__header">
                    <h3>Mis Tareas Activas</h3>
                </div>
                <table class="table">
                    <tr>
                        <th>ID</th>
                        <th>Asunto</th>
                        <th>Estado</th>
                        <th>Archivos</th>
                        <th>Acción</th>
                    </tr>${rows}
                </table>
            </div>`;
}
function getTicketDetailTemplate(ticket) {
    const filesList = ticket.archivos ? ticket.archivos.map(f => `
        <li style="margin-bottom: 20px;">
            <a href="${escapeHTML(f.url)}" target="_blank" class="btn btn--primary" style="font-size: 12px; text-decoration: none;">
                📄 Descargar ${escapeHTML(f.nombre)}
            </a>
        </li>`).join('') : '<li>No hay archivos adjuntos.</li>';

    return `
        <div class="panel">
            <div class="panel__header">
                <h3>Detalle del Ticket #${escapeHTML(ticket.id)}</h3>
                <button class="btn btn--danger" onclick="initializeDashboard('Trabajador')">Volver al listado</button>
            </div>
            <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fdfdfd;">
                <p><strong>Asunto:</strong> ${escapeHTML(ticket.asunto)}</p>
                <p><strong>Estado Actual:</strong> <span class="badge">${escapeHTML(ticket.estado)}</span></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                <h4>Descripción del Problema:</h4>
                <p style="white-space: pre-wrap; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #eee;">
                    ${escapeHTML(ticket.contenido || "El cliente no proporcionó una descripción adicional.")}
                </p>
                <div style="margin-top: 20px;">
                    <h4>Documentación adjunta:</h4>
                    <ul style="list-style: none; padding: 10px 0;">${filesList}</ul>
                </div>
            </div>
            
            <div class="panel__header" style="margin-top: 25px;">
                <h4>Registrar Respuesta / Resolución</h4>
            </div>
            <form id="form-resolver-ticket" onsubmit="handleResolveTicket(event, ${ticket.id})">
                <label class="form-label">Notas de trabajo / Respuesta al cliente</label>
                <textarea id="respuesta-trabajador" class="form-control" rows="4" placeholder="Escribe aquí los pasos realizados o la solución..." required></textarea>
                
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="submit" class="btn btn--success">Actualizar y Notificar</button>
                </div>
            </form>
        </div>
    `;
}
function getClientTemplate(tickets) {
    const historyRows = tickets.length ? tickets.map(t => `
        <tr><td>#${escapeHTML(t.id)}</td><td>${escapeHTML(t.asunto)}</td><td><strong>${escapeHTML(t.estado)}</strong></td><td>${escapeHTML(t.respuesta)}</td></tr>
    `).join('') : `<tr><td colspan="4">No hay tickets.</td></tr>`;
    return `
        <div class="panel">
            <div class="panel__header"><h3>Historial de Tickets</h3></div>
            <table class="table"><tr><th>ID</th><th>Asunto</th><th>Estado</th><th>Respuesta</th></tr>${historyRows}</table>
        </div>

        <div class="ticket-usr__form panel" style="margin-top:20px;">
            <form id="form-cliente-ticket" onsubmit="handlePreSubmitTicket(event)">
                <legend>Crear un ticket</legend>
                <label for="titulo">Titulo</label>
                <input type="text" id="titulo" class="form-control" required placeholder="Introduzca un titulo">
                
                <label for="contenido">Contenido</label>
                <textarea id="contenido" class="form-control" required placeholder="Introduzca el contenido del ticket" rows="3"></textarea>
                
                <label for="adjunto" class="add__file">Adjuntar archivo</label>
                <input type="file" id="adjunto" class="form-control" accept="image/*,video/*" multiple onchange="handleFileSelect(this)">
                
                <ul id="adjunto-lista" style="margin: 10px 0; list-style: none; padding: 0;"></ul>
                
                <button type="submit" class="btn btn--success">Enviar ticket</button>
            </form>
        </div>

        <div id="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 350px; text-align: center;">
                <p>¿Estás seguro de que quieres enviar el ticket?</p>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn--danger" onclick="closeConfirmModal()">Cancelar</button>
                    <button type="button" class="btn btn--success" onclick="processClientTicketSubmit()">Enviar</button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 5. MANEJADORES DE EVENTOS
// ==========================================

// --- Lógica de Archivos ---
function handleFileSelect(input) {
    Array.from(input.files).forEach(file => {
        archivosSeleccionados.push(file);
    });
    
    // 2. RENDERIZAMOS la lista visual
    renderListaArchivos();
    
    // 3. Vaciamos el input físico.
    // Al estar los archivos ya en 'archivosSeleccionados', no los perdemos,
    // pero permitimos que el input acepte archivos repetidos después.
    input.value = "";
}

function renderListaArchivos() {
    const lista = document.getElementById('adjunto-lista');
    if (!lista) return;
    
    lista.innerHTML = '';
    if (archivosSeleccionados.length === 0) {
        lista.innerHTML = '<li style="color:#888; font-size:13px;">Ningún archivo seleccionado</li>';
        return;
    }
    
    archivosSeleccionados.forEach((file, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.marginBottom = '5px';
        li.innerHTML = `
            <span style="font-size: 0.9em;">${escapeHTML(file.name)}</span>
            <button type="button" style="border:none; background:none; cursor:pointer; color:red;" onclick="eliminarArchivo(${index})">✕</button>
        `;
        lista.appendChild(li);
    });
}

function eliminarArchivo(index) {
    archivosSeleccionados.splice(index, 1);
    renderListaArchivos();
}

// --- Lógica del Modal ---
function handlePreSubmitTicket(event) {
    event.preventDefault();
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeConfirmModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// --- Lógica de Envío Final (Integración con API) ---
async function processClientTicketSubmit() {
    closeConfirmModal();
    const btn = document.querySelector('#form-cliente-ticket button[type="submit"]');
    btn.disabled = true; 
    btn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value.trim());
    formData.append('contenido', document.getElementById('contenido').value.trim());
    formData.append('id_cliente', currentUser.id);
    
    // Añadimos los archivos que están en nuestro array global
    archivosSeleccionados.forEach(file => {
        formData.append('archivos_adjuntos[]', file);
    });

    console.log("BACKEND: Enviando Ticket...");
    
    setTimeout(() => {
        alert("Ticket creado con éxito.");
        btn.disabled = false;
        btn.textContent = "Enviar ticket";
        archivosSeleccionados = []; // Limpiar archivos
        initializeDashboard('Cliente'); // Recargar vista
    }, 1500);
}

function openTicketDetail(ticket) {
    const title = document.getElementById("view-title");
    title.textContent = `Gestionando Ticket #${ticket.id}`;
    safeRender("content-area", getTicketDetailTemplate(ticket));
}

async function handleResolveTicket(event, ticketId) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    const respuesta = document.getElementById('respuesta-trabajador').value;

    btn.disabled = true;
    btn.textContent = "Guardando...";

    console.log(`BACKEND: Guardando resolución para ticket ${ticketId}`, { respuesta });

    setTimeout(() => {
        alert(`Ticket #${ticketId} actualizado correctamente.`);
        initializeDashboard('Trabajador'); // Regresa a la lista principal
    }, 1000);
}

// También añade esta función si no la tenías para el botón de la tabla
function toggleFiles(ticketId) {
    const el = document.getElementById(`files-${ticketId}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
// ===============================
// MODAL NOTICIAS
// ===============================
function toggleAdminNewsModal(show) {
    const modal = document.getElementById("admin-news-modal");
    if (modal) modal.style.display = show ? "flex" : "none";
}

function showLoader() {
    document.getElementById("loader").classList.add("loader--active");
}

function hideLoader() {
    document.getElementById("loader").classList.remove("loader--active");
}
async function loadData() {
    showLoader();

    try {
        // Simulación de carga
        await new Promise(res => setTimeout(res, 1500));
    } finally {
        hideLoader();
    }
}

async function handleAdminNewsSubmit(event) {
    event.preventDefault();

    const btn = event.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Publicando...";

    const titulo = document.getElementById("news-title").value.trim();
    const contenido = document.getElementById("news-content").value.trim();
    const imagen = document.getElementById("news-image").files[0];

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("contenido", contenido);
    if (imagen) formData.append("imagen", imagen);

    console.log("BACKEND: enviar noticia", [...formData]);

    // Simulación
    setTimeout(() => {
        alert("Noticia publicada");
        toggleAdminNewsModal(false);
        btn.disabled = false;
        btn.textContent = "Publicar";
        event.target.reset();

        initializeDashboard('admin'); // recargar
    }, 1000);
}

function deleteNews(id) {
    if (!confirm("¿Eliminar esta noticia?")) return;

    console.log("BACKEND: eliminar noticia", id);

    setTimeout(() => {
        alert("Noticia eliminada 🗑️");
        initializeDashboard('admin');
    }, 500);
}