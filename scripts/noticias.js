const grid = document.getElementById("noticias-grid");
const template = document.getElementById("card-blog-template");

async function loadPosts() {
    try {
        const res = await fetch("/api/noticias");
        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            grid.innerHTML = "<p>No hay noticias todavia.</p>";
            return;
        }
        grid.replaceChildren();
        
        posts.forEach(post => {
            const clone = template.content.cloneNode(true);
            const img   = clone.querySelector('.card-blog__image');

            if (post.imagen_url) {
                img.src = post.imagen_url;
                img.alt = post.titulo;
            } else {
                img.style.display = 'none';
            }

            clone.querySelector('.card-blog__tag').textContent     = post.categoria || '';
            clone.querySelector('.card-blog__title').textContent   = post.titulo;
            clone.querySelector('.card-blog__excerpt').textContent = post.contenido.substring(0, 180) + '...';
            clone.querySelector('.card-blog__btn').href            = `blog.html?slug=${encodeURIComponent(post.slug)}`;

            grid.appendChild(clone);
        });
            
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
