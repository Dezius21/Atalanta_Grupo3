(function () {
    const cards = document.querySelectorAll('.main__card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach(card => card.classList.add('visible'));
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    const grid = document.querySelector('.main__grid');
    if (grid) observer.observe(grid);
  })();