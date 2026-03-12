const modal = document.querySelector(".modal-overlay");
const botonesAbrir = document.querySelectorAll(".btn-apertura-formulario");
const botonesCerrar = document.querySelectorAll(".modal-cerrar");
const formElement = document.querySelector(".form-contact");

const cerrarModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    if (formElement) formElement.reset();
};

const abrirModal = (e) => {
    e.preventDefault();
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
};

// itera sobre todos los botones de abrir
botonesAbrir.forEach(btn => btn.addEventListener("click", abrirModal));

// itera sobre todos los botones de cerrar
botonesCerrar.forEach(btn => btn.addEventListener("click", cerrarModal));


window.addEventListener("click", (event) => {
    if (event.target === modal) cerrarModal();
});

if (formElement) {
    formElement.addEventListener("submit", (e) => {
    });
}