//js para que el header aparezca y se oculte en base a si scrolleas hacia arriba o abajo
//el nombre del header habra que cambiarlo

/* este es el css que me pone que hay que añadir
header{
    position: fixed;
    top: 0;
    width: 100%;
    transition: transform 0.3s ease;
    z-index: 1000;
}

header.oculto{
    transform: translateY(-100%);
}

*/

const header = document.querySelector('header');
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