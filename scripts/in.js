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