const btnToggle = document.getElementById('btnToggleModo');
const iconModo = document.getElementById('iconModo');

function aplicarModo(modo) {
  if (modo === 'claro') {
    document.body.classList.add('modo-claro');
    iconModo.className = 'bi bi-sun-fill';
    btnToggle.textContent = ' Modo Claro';
    btnToggle.prepend(iconModo);
  } else {
    document.body.classList.remove('modo-claro');
    iconModo.className = 'bi bi-moon-fill';
    btnToggle.textContent = ' Modo Oscuro';
    btnToggle.prepend(iconModo);
  }
  localStorage.setItem('modo', modo);
}

// Carga la preferencia guardada o modo oscuro por defecto
const modoGuardado = localStorage.getItem('modo') || 'oscuro';
aplicarModo(modoGuardado);

// Cambiar modo al hacer click
btnToggle.addEventListener('click', () => {
  const modoActual = document.body.classList.contains('modo-claro') ? 'claro' : 'oscuro';
  const nuevoModo = modoActual === 'oscuro' ? 'claro' : 'oscuro';
  aplicarModo(nuevoModo);
});