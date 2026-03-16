const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

submitBtn.addEventListener("click", async () => {
  const titulo   = document.getElementById("titulo").value.trim();
  const contenido = document.getElementById("contenido").value.trim();
  const imagenInput = document.getElementById("imagen");
  const imagen = imagenInput ? imagenInput.files[0] : null;

  statusMsg.className = "";
  statusMsg.textContent = "";

  if (!titulo) {
    statusMsg.textContent = "El título es obligatorio.";
    statusMsg.className = "error-msg";
    return;
  }
  if (!contenido) {
    statusMsg.textContent = "El contenido es obligatorio.";
    statusMsg.className = "error-msg";
    return;
  }

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("contenido", contenido);
  if (imagen) formData.append("imagen", imagen);

  submitBtn.disabled = true;
  submitBtn.textContent = "Publicando...";

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      statusMsg.textContent = "Error: " + data.error;
      statusMsg.className = "error-msg";
      return;
    }

    statusMsg.textContent = "¡Noticia publicada correctamente!";
    statusMsg.className = "success-msg";
    document.getElementById("titulo").value = "";
    document.getElementById("contenido").value = "";
    document.getElementById("imagen").value = "";

  } catch (err) {
    statusMsg.textContent = "Error de conexión con el servidor.";
    statusMsg.className = "error-msg";
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Publicar";
  }
});