const track   = document.querySelector('.carousel-track');
const items   = document.querySelectorAll('.carousel-item');
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');
const wrapper = document.querySelector('.main__carousel-container');

const total        = items.length;
let current        = 0;
let autoplayTimer  = null;

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
track.style.transition = 'none';
track.style.transform  = `translateX(-${current * 50}%)`;

function goTo(index) {
    current = index;
    track.style.transition = 'transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    track.style.transform  = `translateX(-${current * 50}%)`;

    track.addEventListener('transitionend', () => {
        const totalSlides = track.children.length;

        if (current >= totalSlides - total) {
            track.style.transition = 'none';
            current = total;
            track.style.transform = `translateX(-${current * 50}%)`;
        }

        if (current < total) {
            track.style.transition = 'none';
            current = totalSlides - total * 2;
            track.style.transform = `translateX(-${current * 50}%)`;
        }
    }, { once: true });
}

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

startAutoPlay();