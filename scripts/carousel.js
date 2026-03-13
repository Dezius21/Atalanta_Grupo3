const track   = document.querySelector('.carousel-track');
const items   = document.querySelectorAll('.carousel-item');
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');
const wrapper = document.querySelector('.main__carousel-container');

const total        = items.length;
let current        = 0;
let autoplayTimer  = null;

// 1. Clonar elementos para el efecto infinito
items.forEach(item => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
});

[...items].reverse().forEach(item => {
    const clone = item.cloneNode(true);
    track.prepend(clone);
});

const offset = total;
current = offset;

// 2. FUNCIÓN CLAVE: Medir el ancho dinámico exacto de la tarjeta
function getSlideWidth() {
    return track.firstElementChild.getBoundingClientRect().width;
}

// 3. Aplicar el movimiento en PÍXELES exactos en lugar de porcentajes
function updateTrackPosition(animate = true) {
    const width = getSlideWidth();
    track.style.transition = animate ? 'transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    track.style.transform  = `translateX(-${current * width}px)`;
}

// Inicializar la posición del carrusel sin animación
updateTrackPosition(false);

function goTo(index) {
    current = index;
    updateTrackPosition(true);

    track.addEventListener('transitionend', () => {
        const totalSlides = track.children.length;

        // Reinicio silencioso si llegamos al final de los clones
        if (current >= totalSlides - total) {
            current = total;
            updateTrackPosition(false);
        }

        // Reinicio silencioso si llegamos al principio de los clones
        if (current < total) {
            current = totalSlides - total * 2;
            updateTrackPosition(false);
        }
    }, { once: true });
}

// 4. Recalcular la posición automáticamente si la pantalla cambia de tamaño
window.addEventListener('resize', () => {
    updateTrackPosition(false);
});

btnPrev.addEventListener('click', () => goTo(current - 1));
btnNext.addEventListener('click', () => goTo(current + 1));

function startAutoPlay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(current + 1), 4000);
}

function stopAutoPlay() {
    clearInterval(autoplayTimer);
}

wrapper.addEventListener('mouseenter', stopAutoPlay);
wrapper.addEventListener('mouseleave', startAutoPlay);

// 5. Soporte táctil: pausar el carrusel al tocarlo en móviles
wrapper.addEventListener('touchstart', stopAutoPlay);
wrapper.addEventListener('touchend', startAutoPlay);

// Un pequeño retardo antes de arrancar asegura que el CSS ya haya cargado los anchos
setTimeout(startAutoPlay, 100);