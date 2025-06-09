document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(productos => {
      const activos = productos.filter(p => p.activo);
      activos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      const botonesDiv = document.querySelector('.botones-categorias');
      const contenedorLibros = document.getElementById('libros-container');
      const contenedorSeparadores = document.getElementById('separadores-container');

      // Renderiza los botones de categorías
      if (botonesDiv) {
        botonesDiv.innerHTML = `
          <button class="btn btn-outline-primary me-2" data-categoria="todos">Todos</button>
          <button class="btn btn-outline-primary me-2" data-categoria="libro">Libros</button>
          <button class="btn btn-outline-primary me-2" data-categoria="comic">Cómics</button>
          <button class="btn btn-outline-primary me-2" data-categoria="manga">Mangas</button>
        `;
      }

      // Función principal para renderizar productos
      function renderizarProductos(contenedor, productos) {
        contenedor.innerHTML = '';

        productos.forEach(prod => {
          const div = document.createElement("div");
          div.classList.add("producto", "card", "m-2", "p-2");

          const carrito = getCarrito();
          const itemEnCarrito = carrito.find(p => p._id === prod._id);
          const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

          div.innerHTML = `
            <div class="card-body position-relative">
              <img src="${prod.imagen || '/img/placeholder.png'}" class="card-img-top mb-2" alt="${prod.nombre}">
              <h5 class="card-title">${prod.nombre}</h5>
              <p class="card-text">Precio: $${prod.precio}</p>

              <div class="boton-agregar-container ${cantidad > 0 ? 'd-none' : ''}">
                <button class="btn btn-primary btn-agregar" data-id="${prod._id}">Agregar al Carrito</button>
              </div>

              <div class="control-cantidad ${cantidad > 0 ? '' : 'd-none'}" data-id="${prod._id}">
                <div class="fila-controles">
                  <button class="btn btn-sm btn-secondary btn-restar">-</button>
                  <span class="mx-2 cantidad-text">${cantidad}</span>
                  <button class="btn btn-sm btn-secondary btn-sumar">+</button>
                </div>
                <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
              </div>

              ${cantidad > 0 ? `<span class="badge bg-gradient position-absolute top-0 end-0 cantidad-badge">${cantidad}</span>` : ''}
            </div>
          `;

          const controlDiv = div.querySelector('.control-cantidad');
          const agregarDiv = div.querySelector('.boton-agregar-container');

          // Botón [+]
          controlDiv.querySelector('.btn-sumar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            const nuevaCantidad = getCantidadEnCarrito(prod._id);
            controlDiv.querySelector('.cantidad-text').textContent = nuevaCantidad;
            actualizarCantidadCarrito();
            actualizarBadge(div, nuevaCantidad);
          });

          // Botón [-]
          controlDiv.querySelector('.btn-restar').addEventListener('click', () => {
            restarDelCarrito(prod._id);
            const nuevaCantidad = getCantidadEnCarrito(prod._id);
            if (nuevaCantidad <= 0) {
              controlDiv.classList.add('d-none');
              agregarDiv.classList.remove('d-none');
              actualizarBadge(div, 0);
            } else {
              controlDiv.querySelector('.cantidad-text').textContent = nuevaCantidad;
              actualizarBadge(div, nuevaCantidad);
            }
            actualizarCantidadCarrito();
          });

          // Botón Eliminar
          controlDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
            quitarDelCarrito(prod._id);
            controlDiv.classList.add('d-none');
            agregarDiv.classList.remove('d-none');
            actualizarBadge(div, 0);
            actualizarCantidadCarrito();
          });

          // Botón Agregar al carrito
          div.querySelector('.btn-agregar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            controlDiv.classList.remove('d-none');
            agregarDiv.classList.add('d-none');
            controlDiv.querySelector('.cantidad-text').textContent = getCantidadEnCarrito(prod._id);
            actualizarBadge(div, getCantidadEnCarrito(prod._id));
            actualizarCantidadCarrito();
          });

          contenedor.appendChild(div);
        });
      }

      // Actualiza el badge con la cantidad actual
      function actualizarBadge(div, cantidad) {
        let badge = div.querySelector('.cantidad-badge');
        if (!badge && cantidad > 0) {
          badge = document.createElement('span');
          badge.classList.add('badge', 'bg-gradient', 'position-absolute', 'top-0', 'end-0', 'cantidad-badge');
          div.querySelector('.card-body').appendChild(badge);
        }
        if (badge) {
          if (cantidad > 0) {
            badge.textContent = cantidad;
          } else {
            badge.remove();
          }
        }
      }

      let categoriaActual = 'todos';

      // Renderiza productos según categoría
      function renderizarProductosPorCategoria(categoria) {
        let filtrados;
        if (categoria === 'todos') {
          filtrados = activos.filter(p => p.categoria !== 'separador');
        } else {
          filtrados = activos.filter(p => p.categoria === categoria);
        }
        renderizarProductos(contenedorLibros, filtrados);
      }

      // Renderiza separadores
      function renderizarSeparadores() {
        const separadores = activos.filter(p => p.categoria === 'separador');
        renderizarProductos(contenedorSeparadores, separadores);
      }

      // Botones de categorías
      botonesDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          botonesDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          categoriaActual = e.target.dataset.categoria;
          renderizarProductosPorCategoria(categoriaActual);
        }
      });

      // Inicialización
      botonesDiv.querySelector('button[data-categoria="todos"]').classList.add('active');
      renderizarProductosPorCategoria(categoriaActual);
      renderizarSeparadores();
      actualizarCantidadCarrito();
    })
    .catch(error => console.error('Error al cargar los productos:', error));
});

// ---------------------
// Funciones de carrito
// ---------------------
function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function setCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
  let carrito = getCarrito();
  const index = carrito.findIndex(p => p._id === producto._id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  setCarrito(carrito);
}

function restarDelCarrito(id) {
  let carrito = getCarrito();
  const index = carrito.findIndex(p => p._id === id);
  if (index !== -1) {
    if (carrito[index].cantidad > 1) {
      carrito[index].cantidad -= 1;
    } else {
      carrito.splice(index, 1);
    }
  }
  setCarrito(carrito);
}

function quitarDelCarrito(id) {
  let carrito = getCarrito();
  carrito = carrito.filter(p => p._id !== id);
  setCarrito(carrito);
}

function actualizarCantidadCarrito() {
  const carrito = getCarrito();
  const cantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
  const span = document.getElementById('carrito-cantidad');
  if (span) span.textContent = cantidad;
}

function getCantidadEnCarrito(id) {
  const carrito = getCarrito();
  const item = carrito.find(p => p._id === id);
  return item ? item.cantidad : 0;
}