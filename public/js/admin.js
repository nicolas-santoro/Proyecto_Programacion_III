document.addEventListener('DOMContentLoaded', () => {
  // Simula un usuario admin logueado
  const usuarioAdmin = {
    nombre: "Milena Rodriguez",
    email: "milena@hachis.com",
    rol: "admin"
  };

  // Simula productos y ventas
  const productos = [
    { _id: 1, nombre: "Libro A", precio: 1500, categoria: "libro", activo: true },
    { _id: 2, nombre: "Manga B", precio: 2000, categoria: "manga", activo: false }
  ];
  const ventas = [
    { _id: 1, nombreCliente: "Juan", total: 3000, fecha: "2025-06-20", productos: [{nombre: "Libro A", cantidad: 2}] }
  ];

  // Opciones según rol
  const opcionesPorRol = {
    admin: [
      { id: "verProductos", texto: "Gestionar Productos" },
      { id: "verVentas", texto: "Ver Ventas" },
      { id: "verUsuarios", texto: "Gestionar Usuarios" }
    ],
    editor: [
      { id: "verProductos", texto: "Gestionar Productos" }
    ],
    vendedor: [
      { id: "verVentas", texto: "Ver Ventas" }
    ],
    auditor: [
      { id: "verVentas", texto: "Ver Ventas" }
    ]
  };

  // Mostrar saludo
  document.getElementById('adminSaludo').textContent =
    `¡Hola, ${usuarioAdmin.nombre}! Rol: ${usuarioAdmin.rol}`;

  // Renderiza las opciones del panel según el rol
  const panelOpciones = document.getElementById('panelOpciones');
  panelOpciones.innerHTML = opcionesPorRol[usuarioAdmin.rol].map(op =>
    `<button class="btn btn-primary me-2" data-opcion="${op.id}">${op.texto}</button>`
  ).join('');

  // Maneja los clicks en las opciones
  panelOpciones.addEventListener('click', (e) => {
    if (e.target.dataset.opcion === "verProductos") {
      renderizarProductos();
    }
    if (e.target.dataset.opcion === "verVentas") {
      renderizarVentas();
    }
    if (e.target.dataset.opcion === "verUsuarios") {
      renderizarUsuarios();
    }
  });

  // Renderiza productos
  function renderizarProductos() {
    const cont = document.getElementById('panelContenido');
    cont.innerHTML = `
      <h3>Productos</h3>
      <table class="table table-dark table-hover">
        <thead><tr><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Activo</th></tr></thead>
        <tbody>
          ${productos.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>$${p.precio}</td>
              <td>${p.categoria}</td>
              <td>${p.activo ? "Sí" : "No"}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Renderiza ventas
  function renderizarVentas() {
    const cont = document.getElementById('panelContenido');
    cont.innerHTML = `
      <h3>Ventas</h3>
      <table class="table table-dark table-hover">
        <thead><tr><th>Cliente</th><th>Total</th><th>Fecha</th><th>Productos</th></tr></thead>
        <tbody>
          ${ventas.map(v => `
            <tr>
              <td>${v.nombreCliente}</td>
              <td>$${v.total}</td>
              <td>${v.fecha}</td>
              <td>${v.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Renderiza usuarios (solo para admin)
  function renderizarUsuarios() {
    const cont = document.getElementById('panelContenido');
    cont.innerHTML = `
      <h3>Gestión de Usuarios (Simulado)</h3>
      <p>Aquí podrías ver, crear o editar usuarios administradores.</p>
    `;
  }

  // Por defecto, muestra la primera opción disponible
  if (opcionesPorRol[usuarioAdmin.rol][0]) {
    const primera = opcionesPorRol[usuarioAdmin.rol][0].id;
    if (primera === "verProductos") renderizarProductos();
    if (primera === "verVentas") renderizarVentas();
    if (primera === "verUsuarios") renderizarUsuarios();
  }

  // Cerrar sesión (simulado)
  document.getElementById('btnLogout').addEventListener('click', () => {
    alert('Sesión cerrada (simulado)');
    window.location.href = './loginAdmin.html';
  });
});