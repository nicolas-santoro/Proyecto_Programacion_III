document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(productos => {
      const activos = productos.filter(p => p.activo);
      activos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      const botonesDiv = document.querySelector('.botones-categorias');
      
      if (botonesDiv) {
        botonesDiv.innerHTML = `
          <button class="btn btn-outline-primary me-2" data-categoria="todos">Todos</button>
          <button class="btn btn-outline-primary me-2" data-categoria="libro">Libros</button>
          <button class="btn btn-outline-primary me-2" data-categoria="comic">Cómics</button>
          <button class="btn btn-outline-primary me-2" data-categoria="manga">Mangas</button>
        `;
      }

      const contenedorLibros = document.getElementById('libros-container');
      const contenedorSeparadores = document.getElementById('separadores-container');

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
              <button class="btn btn-primary btn-agregar" data-id="${prod._id}">Agregar al carrito</button>
              ${cantidad > 0 ? `<span class="badge bg-gradient position-absolute top-0 end-0 cantidad-badge">${cantidad}</span>` : ''}
            </div>
          `;

          div.querySelector('.btn-agregar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            actualizarCantidadCarrito();
            const activeTab = document.querySelector('.nav-link.active').dataset.bsTarget;
            if (activeTab === '#libros') {
              renderizarProductosPorCategoria(categoriaActual);
            } else {
              renderizarSeparadores();
            }
          });

          contenedor.appendChild(div);
        });
      }

      let categoriaActual = 'todos'; // Muestra todos por default

      function renderizarProductosPorCategoria(categoria) {
        let filtrados;
        if (categoria === 'todos') {
          filtrados = activos.filter(p => p.categoria !== 'separador');
        } else {
          filtrados = activos.filter(p => p.categoria === categoria);
        }
        renderizarProductos(contenedorLibros, filtrados);
      }

      function renderizarSeparadores() {
        const separadores = activos.filter(p => p.categoria === 'separador');
        renderizarProductos(contenedorSeparadores, separadores);
      }

      // Eventos para los botones de categorías
      botonesDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          // Elimina 'active' de todos
          botonesDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          
          // Agrega 'active' al botón clickeado
          e.target.classList.add('active');

          // Actualiza la categoría actual y renderiza
          categoriaActual = e.target.dataset.categoria;
          renderizarProductosPorCategoria(categoriaActual);
        }
      });

      // Después de generar los botones dinámicamente, activa el de 'Todos' por defecto
      botonesDiv.querySelector('button[data-categoria="todos"]').classList.add('active');

        // Inicialización
        renderizarProductosPorCategoria(categoriaActual); // Muestra todos al inicio
        renderizarSeparadores();
        actualizarCantidadCarrito();
      })

    .catch(error => console.error('Error al cargar los productos:', error));
});

function getCarrito() { // Obtiene el carrito del localStorage
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function setCarrito(carrito) { // Guarda el carrito en el localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) { // Agrega un producto al carrito
  let carrito = getCarrito();
  const index = carrito.findIndex(p => p._id === producto._id); // Busca si el producto ya está en el carrito
  if (index !== -1) { // Si ya está,
    carrito[index].cantidad += 1; // Incrementa la cantidad del producto
  } else {
    carrito.push({ // Si no está, lo agrega al carrito
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  setCarrito(carrito);
}

function quitarDelCarrito(id) {
  let carrito = getCarrito();
  carrito = carrito.filter(p => p._id !== id); // Filtra el carrito para quitar el producto con el id especificado
  setCarrito(carrito); // Guarda el carrito actualizado en el localStorage
}

function actualizarCantidadCarrito() { // Actualiza la cantidad de productos en el carrito
  const carrito = getCarrito();
  const cantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0); // Suma las cantidades de todos los productos en el carrito
  const span = document.getElementById('carrito-cantidad');
  if (span) span.textContent = cantidad; // Actualiza el contenido del span con la cantidad total
}