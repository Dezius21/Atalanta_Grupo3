const grid = document.getElementById("postGrid");

async function loadPosts() {
  try {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    if (posts.length === 0) {
      grid.innerHTML = "<p>No hay noticias todavía.</p>";
      return;
    }

    grid.innerHTML = posts.map(post => `
      <div class="card">
        ${post.destino_imagen
          ? `<img src="/subida/${post.destino_imagen}" alt="${post.titulo}">`
          : ""}
        <div class="card-body">
          <h2>${post.titulo}</h2>
          <p class="card-meta">${new Date(post.fecha_creacion).toLocaleDateString("es-ES")}</p>
          <p>${post.contenido.substring(0, 120)}...</p>
          <a href="blog.html?id=${post.id}" class="btn btn-primary">Leer más</a>
        </div>
      </div>
    `).join("");

  } catch (err) {
    grid.innerHTML = "<p>Error al cargar las noticias.</p>";
    console.error(err);
  }
}

loadPosts();