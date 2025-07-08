// --- ELEMENTOS DEL DOM ---
// Botón que alterna entre modo claro y oscuro
const btnToggle = document.getElementById('btnToggleModo');
// Ícono dentro del botón que cambia según el modo (sol o luna)
const iconModo = document.getElementById('iconModo');

// --- FUNCIÓN PARA APLICAR EL MODO ---
// Recibe 'claro' u 'oscuro' y ajusta clases, texto e ícono en la UI
function aplicarModo(modo) {
  if (modo === 'claro') {
    // Activar modo claro agregando la clase CSS correspondiente
    document.body.classList.add('modo-claro');
    // Cambiar ícono a sol
    iconModo.className = 'bi bi-sun-fill';
    // Cambiar texto del botón y volver a insertar el ícono al inicio
    btnToggle.prepend(iconModo);
  } else {
    // Remover clase modo-claro para activar modo oscuro (por defecto)
    document.body.classList.remove('modo-claro');
    // Cambiar ícono a luna
    iconModo.className = 'bi bi-moon-fill';
    // Cambiar texto del botón y reinsertar el ícono
    btnToggle.prepend(iconModo);
  }
  // Guardar la preferencia en localStorage para persistirla entre sesiones
  localStorage.setItem('modo', modo);
}

// --- CARGA INICIAL ---
// Obtener el modo guardado en localStorage o usar 'oscuro' por defecto
const modoGuardado = localStorage.getItem('modo') || 'oscuro';
// Aplicar el modo guardado al cargar la página
aplicarModo(modoGuardado);

// --- EVENTO CLICK SOBRE EL BOTÓN ---
// Cambia el modo actual (claro <-> oscuro) al hacer click
btnToggle.addEventListener('click', () => {
  // Detectar modo actual según la clase en body
  const modoActual = document.body.classList.contains('modo-claro') ? 'claro' : 'oscuro';
  // Alternar modo
  const nuevoModo = modoActual === 'oscuro' ? 'claro' : 'oscuro';
  // Aplicar el modo nuevo
  aplicarModo(nuevoModo);
});