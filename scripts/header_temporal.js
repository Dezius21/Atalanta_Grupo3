//js para que el header aparezca y se oculte en base a si scrolleas hacia arriba o abajo
//el nombre del header habra que cambiarlo
const header = document.querySelector('.navbar');
let ultimoScroll = 0;

window.addEventListener('scroll', () => {
    const scrollActual = window.scrollY;
    if(scrollActual > ultimoScroll && scrollActual > 100){
        header.classList.add('oculto');
    } else {
        header.classList.remove('oculto');
    }
    ultimoScroll = scrollActual;
});