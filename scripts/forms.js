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
formElement.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btnSubmit = formElement.querySelector('button[type="submit"]');
        const formData = new FormData(formElement);
        const data= Object.fromEntries(formData.entries());

        const textoOriginal=btnSubmit.textContent;
        btnSubmit.disabled=true;
        btnSubmit.textContent = "Enviando...";

        try{
            const response = await fetch('http://localhost:3000/api/contacto/enviar',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok){
                alert('¡Formulario enviado!');
                cerrarModal();
            } else {
                if(result.error && Array.isArray(result.error)){
                    const errorMsgs = result.error.map(err => `• ${err.msg}`).join('\n');
                    alert (`Errores de validación:\n${errorMsgs}`);
                } else {
                    alert ('Error: ' + (result.error || 'Ocurrió un problema al enviar.'));
                }
            }
        } catch (error) {
            console.error('Error en fetch:',error);
            alert('No se pudo conectar con el servidor.');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    });
}
