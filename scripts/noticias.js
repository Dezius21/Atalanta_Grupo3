const grid = document.getElementById("noticias-grid");
const template = document.getElementById("card-blog-template");

async function loadPosts() {
    try {
        const res = await fetch(`${API_URL}/api/noticias`);
        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            grid.innerHTML = "<p>No hay noticias todavía.</p>";
            return;
        }

        grid.replaceChildren(); // Limpia el grid antes de insertar
        
        posts.forEach(post => {
            const clone = template.content.cloneNode(true);
            const img = clone.querySelector('.card-blog__image');

            // Mapeo de datos del Backend al Template
            if (post.imagen_url) {
                img.src = post.imagen_url;
                img.alt = post.titulo;
            } else {
                img.style.display = 'none';
            }

            clone.querySelector('.card-blog__tag').textContent = post.categoria || 'General';
            clone.querySelector('.card-blog__title').textContent = post.titulo;
            
            // Verificamos que post.contenido exista antes de hacer substring
            const extracto = post.contenido ? post.contenido.substring(0, 120) + '...' : '';
            clone.querySelector('.card-blog__excerpt').textContent = extracto;
            
            clone.querySelector('.card-blog__btn').href = `blog.html?slug=${encodeURIComponent(post.slug)}`;

            grid.appendChild(clone);
        });
            
    } catch(err) {
        grid.innerHTML = "<p>Error al conectar con el servidor.</p>";
        console.error("Error al cargar posts:", err);
    }
}

loadPosts();

