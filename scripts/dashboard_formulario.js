// ==========================================
// 1. ESTADO GLOBAL Y AUTENTICACIÓN
// ==========================================

// Verificación de seguridad y sesión


const usuarioGuardado = localStorage.getItem('usuario');
if(!localStorage.getItem('token') || !usuarioGuardado){
    window.location.href = 'register-login.html';
}

// Lectura del usuario logueado
const usuarioDB = JSON.parse(usuarioGuardado);
const currentUser = {
    id: usuarioDB.id,
    name: usuarioDB.nombre,
    role: usuarioDB.rol
};

// Redirigir por seguridad si el rol no es jefe
if (currentUser.role !== 'jefe') {
    window.location.href = 'dashboard.html';
}

let formSubmissions = [];

// ==========================================
// 2. UTILIDADES DE RED Y RENDERIZADO
// ==========================================

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

// Extractor que inyecta el token de seguridad
async function apiFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...(options.headers || {})
        };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = 'register-login.html';
    }
    return res;
}

// ==========================================
// 3. CONTRATO DE API
// ==========================================

const API_FORMULARIOS = {
    getFormularios: async () => {
        // Asegúrate de que API_URL está definida de forma global, o reemplázala con tu dominio.
        // Asume que la ruta es /api/formularios. Ajústala si tu endpoint se llama diferente.
        const res = await apiFetch(`${API_URL}/api/formularios`);
        const data = await res.json();
        return data.formularios || [];
    },
    
    // Método para marcar como visto o eliminar en el backend
    marcarComoVisto: async (id) => {
        // Ejemplo asumiendo un método DELETE. Cámbialo a PATCH si solo actualizas un campo booleano.
        const res = await apiFetch(`${API_URL}/api/formularios/${id}`, {
            method: 'DELETE' 
        });
        if (!res.ok) throw new Error('Error al actualizar el formulario');
        return await res.json();
    }
};

// ==========================================
// 4. CICLO DE VIDA Y RENDERIZADO DE VISTAS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("user-info").textContent = `${currentUser.name} | ${currentUser.role}`;
    renderSidebar(currentUser.role);
    loadFormularios(); // Arranca la extracción de datos asíncrona
});

function renderSidebar(role) {
    let sidebarHTML = `
        <li class="sidebar__item" onclick="window.location.href='dashboard.html'">Dashboard Principal</li>
    `;

    // Verificación de rol para la bandeja de formularios
    if (role === 'jefe') {
        sidebarHTML += `
        <li class="sidebar__item sidebar__item--active" onclick="window.location.href='formularios-jefe.html'">Bandeja de Formularios</li>
        `;
    }

    sidebarHTML += `
        <li class="sidebar__item" onclick="cerrarSesion()">Cerrar Sesión</li>
    `;

    safeRender("sidebar-nav", sidebarHTML);
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'register-login.html';
}

async function loadFormularios() {
    showLoader();
    try {
        // Carga los datos reales del backend
        formSubmissions = await API_FORMULARIOS.getFormularios();
        renderTable();
    } catch (error) {
        console.error("Error al cargar formularios:", error);
        safeRender('content-area', `<div class="panel"><h3 class="text-danger">Error de conexión al cargar la información.</h3></div>`);
    } finally {
        hideLoader();
    }
}

function renderTable() {
    if (formSubmissions.length === 0) {
        safeRender('content-area', `<div class="panel"><p style="text-align:center; padding: 20px;">No hay formularios pendientes de revisión.</p></div>`);
        return;
    }

    const rows = formSubmissions.map(f => `
        <tr>
            <td>#${escapeHTML(f.id)}</td>
            <td>${escapeHTML(f.nombre)}</td>
            <td>${escapeHTML(f.empresa)}</td>
            <td><a href="mailto:${escapeHTML(f.email)}">${escapeHTML(f.email)}</a></td>
            <td>
                <div class="table__actions" style="justify-content: flex-start; gap: 8px; display: flex;">
                    <button class="btn btn--primary btn--sm" title="Ver Detalles" onclick="verDetalle('${f.id}')">
                        👁 Ver
                    </button>
                    <button class="btn btn--danger btn--sm" title="Eliminar/Visto" onclick="eliminarFormulario('${f.id}')">
                        🗑 Visto
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    const template = `
        <div class="panel">
            <div class="panel__header">
                <h3>Nuevos Formularios Web</h3>
            </div>
            <table class="table" style="width: 100%; text-align: left;">
                <tr style="background-color: #f8f9fa;">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
                ${rows}
            </table>
        </div>
    `;

    safeRender('content-area', template);
}

function verDetalle(id) {
    // Si tu ID de backend es numérico, lo pasamos a string para compararlo de forma segura
    const form = formSubmissions.find(f => String(f.id) === String(id));
    if (!form) return;

    const template = `
        <div class="panel layout-center-md">
            <div class="panel__header">
                <h3>Detalle del Formulario #${escapeHTML(form.id)}</h3>
                <button class="btn btn--primary" onclick="renderTable()">Volver a la Lista</button>
            </div>
            
            <div class="panel" style="background: #fdfdfd; margin-top: 20px;">
                <p><strong>Nombre:</strong> ${escapeHTML(form.nombre)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHTML(form.email)}">${escapeHTML(form.email)}</a></p>
                <p><strong>Empresa:</strong> ${escapeHTML(form.empresa)}</p>
                <p><strong>Cargo:</strong> ${escapeHTML(form.cargo)}</p>
                ${form.fase ? `<p><strong>Fase/Interés:</strong> ${escapeHTML(form.fase)}</p>` : ''}
            </div>
            
            <div style="margin-top: 20px;">
                <button class="btn btn--danger" onclick="eliminarFormulario('${form.id}')">
                    🗑 Marcar como visto / Eliminar
                </button>
            </div>
        </div>
    `;

    safeRender('content-area', template);
}

// ==========================================
// 5. CONTROLADORES DE EVENTOS
// ==========================================

async function eliminarFormulario(id) {
    if (confirm("¿Estás seguro de que quieres marcar este formulario como visto? Se eliminará de la bandeja.")) {
        showLoader();
        
        try {
            // Elimina el comentario de la siguiente línea cuando tengas el endpoint activo en el backend
             await API_FORMULARIOS.marcarComoVisto(id); 
            
            // Reflejamos el cambio visualmente
            formSubmissions = formSubmissions.filter(f => String(f.id) !== String(id));
            renderTable(); 
            
        } catch (error) {
            console.error("Error backend:", error);
            alert("No se pudo conectar con el servidor para eliminar el formulario.");
        } finally {
            hideLoader();
        }
    }
}