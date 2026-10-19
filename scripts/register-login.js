const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');

signUpButton.addEventListener('click', () => {
  container.classList.add('auth__container--active-right');
});

signInButton.addEventListener('click', () => {
  container.classList.remove('auth__container--active-right');
});




// ——————————————————————————————

// ——— REGISTRO ———
const formRegister = document.querySelector('.auth__form-area--signup .auth__form');

formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();

  const inputs = formRegister.querySelectorAll('.auth__input');
  const nombre   = inputs[0].value.trim();
  const email    = inputs[1].value.trim();
  const password = inputs[2].value.trim();

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    
    if (!res.ok) {
    const mensaje = Array.isArray(data.error) 
    ? data.error.map(e => e.msg).join('\n') 
    : data.error;
    alert(`Error: ${mensaje}`);
      return;
    }

    alert(data.mensaje);
    // Cambiar al panel de login tras registrarse
    container.classList.remove('auth__container--active-right');

  } catch (err) {
    console.error('Error de red:', err);
    alert('No se pudo conectar con el servidor');
  }
});



// ——— LOGIN ———
const formLogin = document.querySelector('.auth__form-area--signin .auth__form');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const inputs = formLogin.querySelectorAll('.auth__input');
  const email    = inputs[0].value.trim();
  const password = inputs[1].value.trim();

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Error: ${data.error}`);
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error('Error de red:', err);
    alert('No se pudo conectar con el servidor');
  }
});