const adminList = document.getElementById("adminList");

async function loadAdmin() {
  try {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    if (posts.length === 0) {
      adminList.innerHTML = "<p>No hay noticias todavía.</p>";
      return;
    }

    adminList.innerHTML = posts.map(post => `
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-body">
          <h2>${post.titulo}</h2>
          <p class="card-meta">${new Date(post.fecha_creacion).toLocaleDateString("es-ES")}</p>
          <a href="blog.html?id=${post.id}" class="btn btn-primary" style="margin-right:10px;">Ver</a>
          <button class="btn btn-danger" onclick="deletePost(${post.id})">Eliminar</button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    adminList.innerHTML = "<p>Error al cargar las noticias.</p>";
    console.error(err);
  }
}

async function deletePost(id) {
  if (!confirm("¿Seguro que quieres eliminar esta noticia?")) return;

  try {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAdmin(); // refresh the list
    } else {
      alert("Error al eliminar la noticia.");
    }
  } catch (err) {
    alert("Error de conexión.");
    console.error(err);
  }
}

loadAdmin();