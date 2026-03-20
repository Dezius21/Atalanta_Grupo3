// ==========================================
// 1. ESTADO Y DATOS MOCK DE FORMULARIOS
// ==========================================
const currentUser = { id: 102, name: "Esther Howard", role: "jefe" };

// Simulamos la base de datos de los envíos web
let formSubmissions = [
    { id: "FRM001", nombre: "Carlos Perez", empresa: "Tech Corp", email: "carlos@techcorp.com", cargo: "CEO", fase: "Fase de planificación" },
    { id: "FRM002", nombre: "Laura Gomez", empresa: "Data Solutions", email: "laura@datasol.com", cargo: "CISO", fase: "Solución inmediata" },
    { id: "FRM003", nombre: "Miguel Sanz", empresa: "Fintech SL", email: "miguel@fintech.es", cargo: "CTO", fase: "Fase de planificación" },
    { id: "FRM004", nombre: "Ana Ruiz", empresa: "Retail Group", email: "ana@retail.com", cargo: "Responsable IT", fase: "Solución inmediata" },
    { id: "FRM005", nombre: "David Torres", empresa: "Logistics SA", email: "david@logistics.com", cargo: "CEO", fase: "Solución inmediata" }
];

// ==========================================
// 2. UTILIDADES
// ==========================================
function escapeHTML(str) {
    if (!str) return '';
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
    container.innerHTML = htmlString;
}

// ==========================================
// 3. GENERACIÓN DE VISTAS (TEMPLATES)
// ==========================================

// Vista principal: La tabla de formularios
function renderTable() {
    if (formSubmissions.length === 0) {
        safeRender('content-area', `<div class="panel"><p style="text-align:center; padding: 20px;">No hay formularios pendientes de revisión.</p></div>`);
        return;
    }

    const rows = formSubmissions.map(f => `
        <tr>
            <td>${escapeHTML(f.id)}</td>
            <td>${escapeHTML(f.nombre)}</td>
            <td>${escapeHTML(f.empresa)}</td>
            <td><a href="mailto:${escapeHTML(f.email)}">${escapeHTML(f.email)}</a></td>
            <td>
                <div class="table__actions" style="justify-content: flex-start; gap: 8px; display: flex;">
                    <button class="btn btn--primary btn--sm" title="Ver Detalles" onclick="verDetalle('${f.id}')">
                        👁 Ver
                    </button>
                    <button class="btn btn--danger btn--sm" title="Eliminar/Visto" onclick="eliminarFormulario('${f.id}')">
                        🗑 Eliminar
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

// Vista de detalle: Cuando el jefe hace clic en "Ver"
function verDetalle(id) {
    const form = formSubmissions.find(f => f.id === id);
    if (!form) return;

    const template = `
        <div class="panel layout-center-md">
            <div class="panel__header">
                <h3>Detalle del Formulario ${escapeHTML(form.id)}</h3>
                <button class="btn btn--primary" onclick="renderTable()">Volver a la Lista</button>
            </div>
            
            <div class="panel" style="background: #fdfdfd; margin-top: 20px;">
                <p><strong>Nombre:</strong> ${escapeHTML(form.nombre)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHTML(form.email)}">${escapeHTML(form.email)}</a></p>
                <p><strong>Empresa:</strong> ${escapeHTML(form.empresa)}</p>
                <p><strong>Cargo:</strong> ${escapeHTML(form.cargo)}</p>
                <p><strong>Fase o Estado:</strong> ${escapeHTML(form.fase)}</p>
            </div>
            
            <div style="margin-top: 20px;">
                <button class="btn btn--danger" onclick="eliminarFormulario('${form.id}')">
                    🗑 Eliminar este formulario
                </button>
            </div>
        </div>
    `;

    safeRender('content-area', template);
}

// ==========================================
// 4. CONTROLADORES DE EVENTOS
// ==========================================
function eliminarFormulario(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este formulario de la bandeja?")) {
        // Filtramos el formulario para sacarlo del array
        formSubmissions = formSubmissions.filter(f => f.id !== id);
        // Volvemos a pintar la tabla actualizada
        renderTable(); 
    }
}

// Inicialización de la página
document.addEventListener("DOMContentLoaded", () => {
    // Configuramos los datos del usuario en la barra superior
    document.getElementById("user-info").textContent = `${currentUser.name} | ${currentUser.role}`;
    
    // Mostramos la tabla principal
    renderTable();
});