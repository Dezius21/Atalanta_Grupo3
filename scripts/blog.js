const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  window.location.href = "noticias.html";
}

async function loadPost() {
  try {
    const res = await fetch(`/api/posts/${id}`);

    if (!res.ok) {
      document.getElementById("postTitulo").textContent = "Noticia no encontrada";
      return;
    }

    const post = await res.json();

    document.title = post.titulo;
    document.getElementById("postTitulo").textContent = post.titulo;
    document.getElementById("postMeta").textContent =
      new Date(post.fecha_creacion).toLocaleDateString("es-ES");
    document.getElementById("postContenido").textContent = post.contenido;

    if (post.destino_imagen) {
      const banner = document.getElementById("postBanner");
      banner.src = `/subida/${post.destino_imagen}`;
      banner.alt = post.titulo;
      banner.style.display = "block";
    }

  } catch (err) {
    document.getElementById("postTitulo").textContent = "Error al cargar la noticia";
    console.error(err);
  }
}

loadPost();