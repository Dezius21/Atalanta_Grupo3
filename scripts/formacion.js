const wrapperF= document.querySelector('.partners-wrapper');
const logos = document.querySelectorAll('.main__img-partner');

function checkPositions() {
    const wrapperCenter = wrapperF.getBoundingClientRect().left + wrapper.offsetWidth / 2;
    const threshold = 350; 
    logos.forEach(logo => {
        const rect = logo.getBoundingClientRect();
        const logoCenter = rect.left + rect.width / 2;
        const distance = Math.abs(logoCenter - wrapperCenter);

        if (distance < threshold) {
            logo.classList.add('is-center');
        } else {
            logo.classList.remove('is-center');
        }
    });

    requestAnimationFrame(checkPositions);
}

checkPositions();