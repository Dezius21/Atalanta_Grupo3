function mostrarPolitica(politicaId) {

    const secciones = document.querySelectorAll(".politicas");

    secciones.forEach(seccion => {
        seccion.style.display = "none";
    });

    const activa = document.getElementById(politicaId);
    if (activa) {
        activa.style.display = "block";
    }

    // Update URL anchor
    history.replaceState(null, null, "#" + politicaId);
}


// Corre al cargar pagina
window.addEventListener("DOMContentLoaded", () => {

    const hash = window.location.hash.replace("#", "");

    const secciones = document.querySelectorAll(".politicas");

    secciones.forEach(seccion => {
        seccion.style.display = "none";
    });

    if (hash && document.getElementById(hash)) {
        mostrarPolitica(hash);
    } else {
        mostrarPolitica("legal"); // seccion por defecto
    }

});