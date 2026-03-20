// ── Helpers ──────────────────────────────────────────────
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

// ── Get slug from URL ─────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const slug   = params.get('slug');

if (!slug) {
    window.location.href = 'noticias.html';
}

// ── Load the post ─────────────────────────────────────────
async function loadPost() {
    const container = document.getElementById('post-container');

    try {
        const res = await fetch(`/api/noticias/${encodeURIComponent(slug)}`);

        if (!res.ok) {
            container.innerHTML = `
                <a href="noticias.html" class="post__back">← Volver a noticias</a>
                <p style="color:#888; margin-top: 40px;">Noticia no encontrada.</p>
            `;
            return;
        }

        const post = await res.json();

        // Update page title
        document.title = `${post.titulo} | Atalanta`;

        // Render post
        container.innerHTML = `
            <a href="noticias.html" class="post__back">← Volver a noticias</a>

            ${post.categoria
                ? `<span class="post__tag">${escapeHTML(post.categoria)}</span>`
                : ''}

            <h1 class="post__title">${escapeHTML(post.titulo)}</h1>

            <p class="post__meta">${formatDate(post.created_at)}</p>

            <img
                id="post-banner"
                class="post__banner"
                src=""
                alt="${escapeHTML(post.titulo)}"
            >

            <div class="post__content" id="post-content"></div>
        `;

        // Set banner if image exists
        if (post.imagen_url) {
            const banner = document.getElementById('post-banner');
            banner.src   = post.imagen_url;
            banner.style.display = 'block';
        }

        // Set content as text (safe — no innerHTML with user content)
        document.getElementById('post-content').textContent = post.contenido;

        // Load related articles
        await loadRelated(post.slug, post.categoria);

    } catch (err) {
        container.innerHTML = `
            <a href="noticias.html" class="post__back">← Volver a noticias</a>
            <p style="color:#888; margin-top: 40px;">Error al cargar la noticia.</p>
        `;
        console.error(err);
    }
}

// ── Load related articles ─────────────────────────────────
async function loadRelated(currentSlug, categoria) {
    try {
        const res   = await fetch('/api/noticias');
        if (!res.ok) return;
        const all   = await res.json();

        // Filter out current post, prefer same category, max 3
        const related = all
            .filter(n => n.slug !== currentSlug)
            .sort((a, b) => {
                // Same category comes first
                const aMatch = a.categoria === categoria ? -1 : 1;
                const bMatch = b.categoria === categoria ? -1 : 1;
                return aMatch - bMatch;
            })
            .slice(0, 3);

        if (related.length === 0) return;

        const section = document.getElementById('related-section');
        const grid    = document.getElementById('related-grid');

        grid.innerHTML = related.map(n => `
            <article class="card-blog">
                ${n.imagen_url
                    ? `<img class="card-blog__image" src="${n.imagen_url}" alt="${escapeHTML(n.titulo)}" loading="lazy" onerror="this.style.display='none'">`
                    : ''}
                <div class="card-blog__body">
                    ${n.categoria
                        ? `<span class="card-blog__tag">${escapeHTML(n.categoria)}</span>`
                        : ''}
                    <h3 class="card-blog__title">${escapeHTML(n.titulo)}</h3>
                    <a class="card-blog__btn" href="blog.html?slug=${encodeURIComponent(n.slug)}">
                        Leer más →
                    </a>
                </div>
            </article>
        `).join('');

        section.style.display = 'block';

    } catch (err) {
        console.error('Error cargando noticias relacionadas:', err);
    }
}

loadPost();
