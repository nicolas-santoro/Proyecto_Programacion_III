document.addEventListener('DOMContentLoaded', () => {
  // Obtener usuario logueado del localStorage
  const usuarioActual = JSON.parse(localStorage.getItem('user'));
  
  // Verificar si hay usuario logueado
  if (!usuarioActual) {
    window.location.href = './adminLogin.html';
    return;
  }

  console.log('👤 Usuario logueado:', usuarioActual);

  // Configuración de opciones por rol
  const opcionesPorRol = {
    admin: [
      { id: "gestionarProductos", texto: "Gestionar Productos", icono: "📦" },
      { id: "verVentas", texto: "Ver Ventas", icono: "🛒" },
      { id: "gestionarUsuarios", texto: "Gestionar Usuarios", icono: "👥" },
      { id: "verAuditoria", texto: "Ver Auditoría", icono: "📊" }
    ],
    editor: [
      { id: "gestionarProductos", texto: "Gestionar Productos", icono: "📦" }
    ],
    vendedor: [
      { id: "verVentas", texto: "Ver Ventas", icono: "🛒" }
    ],
    auditor: [
      { id: "verVentas", texto: "Ver Ventas", icono: "🛒" },
      { id: "verAuditoria", texto: "Ver Auditoría", icono: "📊" }
    ]
  };

  // Mostrar saludo personalizado
  const elementoSaludo = document.getElementById('adminSaludo');
  if (elementoSaludo) {
    elementoSaludo.textContent = `¡Hola, ${usuarioActual.nombre}! Rol: ${usuarioActual.rol}`;
    elementoSaludo.className = 'text-light text-center'; // pa que sea clarito el mensaje del admin
  }

  // Renderizar botones según el rol del usuario
  const contenedorOpciones = document.getElementById('panelOpciones');
  if (contenedorOpciones && opcionesPorRol[usuarioActual.rol]) {
    contenedorOpciones.innerHTML = opcionesPorRol[usuarioActual.rol]
      .map(opcion => `
        <button class="btn btn-primary me-2 mb-2" data-opcion="${opcion.id}">
          ${opcion.icono} ${opcion.texto}
        </button>
      `).join('');

    // Manejar clicks en los botones
    contenedorOpciones.addEventListener('click', (evento) => {
      const botonClickeado = evento.target.closest('[data-opcion]');
      if (botonClickeado) {
        const opcionSeleccionada = botonClickeado.dataset.opcion;
        manejarSeleccionOpcion(opcionSeleccionada);
      }
    });
  }

  // Función para manejar la selección de opciones
  function manejarSeleccionOpcion(opcion) {
    const contenedorPrincipal = document.getElementById('panelContenido');
    if (!contenedorPrincipal) return;

    let tituloSeccion = '';
    let mensajeTemporal = '';

    switch (opcion) {
      case 'gestionarProductos':
        tituloSeccion = '📦 Gestión de Productos';
        mensajeTemporal = 'Aquí podrás crear, editar y eliminar productos del sistema.';
        break;
      case 'verVentas':
        tituloSeccion = '🛒 Gestión de Ventas';
        mensajeTemporal = 'Aquí podrás ver y gestionar todas las ventas realizadas.';
        break;
      case 'gestionarUsuarios':
        tituloSeccion = '👥 Gestión de Usuarios';
        mensajeTemporal = 'Aquí podrás administrar los usuarios del sistema.';
        break;
      case 'verAuditoria':
        tituloSeccion = '📊 Auditoría del Sistema';
        mensajeTemporal = 'Aquí podrás revisar todas las acciones realizadas en el sistema.';
        break;
      default:
        tituloSeccion = '⚙️ Función no disponible';
        mensajeTemporal = 'Esta funcionalidad aún no está implementada.';
    }

    // Mostrar la sección seleccionada
    contenedorPrincipal.innerHTML = `
      <div class="card bg-dark border-primary">
        <div class="card-header">
          <h3 class="mb-0">${tituloSeccion}</h3>
        </div>
        <div class="card-body text-center py-5">
          <div class="mb-4">
            <i class="bi bi-tools display-1 text-warning"></i>
          </div>
          <h4 class="text-warning mb-3">🚧 En Desarrollo</h4>
          <p class="lead text-light">${mensajeTemporal}</p>
          <p class="text-light">Esta funcionalidad se implementará en las próximas versiones.</p>
          <hr class="my-4">
          <button class="btn btn-outline-primary" onclick="volverAInicio()">
            ← Volver al Panel Principal
          </button>
        </div>
      </div>
    `;
  }

  // Función para volver al inicio
  window.volverAInicio = function() {
    const contenedorPrincipal = document.getElementById('panelContenido');
    if (contenedorPrincipal) {
      contenedorPrincipal.innerHTML = `
        <div class="text-center py-5">
          <h2 class="text-primary mb-4"> Panel de Administración</h2>
          <p class="lead text-light">Selecciona una opción del menú superior para comenzar.</p>
          <div class="mt-4">
            <i class="bi bi-book display-1 text-primary opacity-25"></i>
          </div>
        </div>
      `;
    }
  };

  // Configurar botón de cerrar sesión
  const botonCerrarSesion = document.getElementById('btnAdminLogout');
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener('click', () => {
      // Confirmar antes de cerrar sesión
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        // Limpiar datos del localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        console.log('🚪 Sesión cerrada correctamente');
        
        // Redirigir al login
        window.location.href = './adminLogin.html';
      }
    });
  }

  // Mostrar mensaje de bienvenida por defecto
  volverAInicio();

  console.log('✅ Panel de administración cargado correctamente');
});