const grid = document.getElementById("postGrid");

async function loadPosts() {
    try {
        const res = await fetch("/api/noticias");
        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            grid.innerHTML = "<p>No hay noticias todavia.</p>";
            return;
        }

        grid.innerHTML = posts.map(post => `
            <div class="card">
                ${post.imagen_url
                    ?`<img src="${post.imagen_url}" alt="${escapeHTML(post.titulo)}">`
                    : ""}
                <div class="card-body">
                    <h2>${escapeHTML(post.titulo)}</h2>
                    <p class="card-meta">
                        ${post.categoria ? `<span>${escapeHTML(post.categoria)}</span> . ` : ""}
                        ${new Date(post.created_at).toLocaleDateString("es-ES")}
                    </p>
                    <a herf="blog.html?slug=${encodeURIComponent(post.slug)}" class="btn btn-primary">Leer mas</a>
                </div>
            </div>
            `).join("");
            
    }catch(err){
        grid.innerHTML="<p>Error al cargar las noticias</p>";
        console.error(err);
    }
}

// Escapa HTML para evitar XSS en el renderizado de tarjetas
function escapeHTML(str){
    if(!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadPosts();