const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('auth-container');

signUpButton.addEventListener('click', () => {
  container.classList.add('auth__container--active-right');
});

signInButton.addEventListener('click', () => {
  container.classList.remove('auth__container--active-right');
});