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
if (galeria) observer.observe(galeria);

(function () {
  const TOTAL    = 3;
  const DELAY    = 5000; 

  const bgs      = document.querySelectorAll('.hero__bg');
  const slides   = document.querySelectorAll('.hero__slide');
  const dots     = document.querySelectorAll('.hero__dot');
  const progress = document.querySelector('.hero__progress');
  const prevBtn  = document.querySelector('.hero__arrow--prev');
  const nextBtn  = document.querySelector('.hero__arrow--next');

  let current = 0;
  let timer   = null;

  function goTo(index) {
    bgs[current].classList.remove('hero__bg--active');
    slides[current].classList.remove('hero__slide--active');
    dots[current].classList.remove('hero__dot--active');

    current = ((index % TOTAL) + TOTAL) % TOTAL;
    bgs[current].classList.add('hero__bg--active');
    slides[current].classList.add('hero__slide--active');
    dots[current].classList.add('hero__dot--active');

    resetProgress();
  }

  function resetProgress() {
    if (!progress) return;
    progress.classList.remove('hero__progress--running');
    void progress.offsetWidth;
    progress.classList.add('hero__progress--running');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); });
  });

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', stopAuto);
    heroEl.addEventListener('mouseleave', () => { startAuto(); resetProgress(); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  resetProgress();
  startAuto();
})();

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