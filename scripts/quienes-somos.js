const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.3});

document.querySelectorAll('.team__row').forEach((row, index) => {
    row.computedStyleMap.transitionDelay = `${index * 0.2}s`;
    observer.observe(row);
});