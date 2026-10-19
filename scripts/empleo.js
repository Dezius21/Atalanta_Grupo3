document.addEventListener("DOMContentLoaded", () => {
    const selectUbicacion = document.getElementById("ubicacion");
    const selectEquipo = document.getElementById("equipos");
    const selectContrato = document.getElementById("contrato");

    const ofertas = document.querySelectorAll(".employment-item");
    const contenedores = document.querySelectorAll(".container-employment");

    function filtrarOfertas() {
        const valUbicacion = selectUbicacion.value.toLowerCase();
        const valEquipo = selectEquipo.value.toLowerCase();
        const valContrato = selectContrato.value.toLowerCase();

        ofertas.forEach(oferta => {
            const ubicacionOferta = oferta.getAttribute("data-ubicacion").toLowerCase();
            const equipoOferta = oferta.getAttribute("data-equipo").toLowerCase();
            const contratoOferta = oferta.getAttribute("data-contrato").toLowerCase();

            const coincideUbicacion = (valUbicacion === "" || ubicacionOferta === valUbicacion);
            const coincideEquipo = (valEquipo === "" || equipoOferta === valEquipo);
            const coincideContrato = (valContrato === "" || contratoOferta === valContrato);

            if (coincideUbicacion && coincideEquipo && coincideContrato) {
                oferta.style.display = "block"; 
            } else {
                oferta.style.display = "none";
            }
        });

        contenedores.forEach(contenedor => {
            const ofertasVisibles = Array.from(contenedor.querySelectorAll(".employment-item")).filter(
                item => item.style.display !== "none"
            );

            if (ofertasVisibles.length === 0) {
                contenedor.style.display = "none";
            } else {
                contenedor.style.display = "block";
            }
        });
    }


    if(selectUbicacion && selectEquipo && selectContrato) {
        selectUbicacion.addEventListener("change", filtrarOfertas);
        selectEquipo.addEventListener("change", filtrarOfertas);
        selectContrato.addEventListener("change", filtrarOfertas);
        }
    });