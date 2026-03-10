
const modal = document.getElementById("form");
const btnAbrir = document.getElementById("btn-apertura-formulario");
const btnCerrar = document.getElementById("btnCerrar");
const formElement = document.querySelector(".form-contact");

const cerrarModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    
    if (formElement) formElement.reset();
};

btnAbrir.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
});

if(btnCerrar) {
    btnCerrar.onclick = cerrarModal;
}

window.onclick = (event) => {
    if (event.target == modal) {
        cerrarModal();
    }
};

formElement.addEventListener("submit", (e) => {
});