const galeria = document.querySelector('.index__galeria');
const imagenes = document.querySelectorAll('.index__galeria img');
const groupSize = 4;
const intervalo = 700;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      imagenes.forEach((img, i) => {
        const delay = Math.floor(i / groupSize) * intervalo;
        setTimeout(() => {
          img.classList.add('visible');
        }, delay);
      });
      observer.unobserve(galeria);
    }
  });
}, {
  threshold: 0.2
});

observer.observe(galeria)


function animarNumero(elemento, destino, duracion) {
    let inicio = 0;
    const incremento = destino / (duracion / 16);
    const timer = setInterval(() => {
        inicio += incremento;
        if (inicio >= destino) {
            inicio = destino;
            clearInterval(timer);
        }
        elemento.textContent = "+" + Math.floor(inicio);
    }, 16);
}

const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numeros = entry.target.querySelectorAll(".index__confian-number p");
            numeros.forEach(p => {
                const valorFinal = parseInt(p.textContent.replace("+", ""));
                animarNumero(p, valorFinal, 1500);
            });
            observer2.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const contenedor = document.querySelector(".index__confian-stats");
if (contenedor) observer2.observe(contenedor);
