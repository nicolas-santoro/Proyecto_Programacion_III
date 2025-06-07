document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:3000/api/productos")
    .then(res => res.json()) // Obtener productos desde la API
    .then(productos => {
      // Filtrar solo productos activos
      const activos = productos.filter(p => p.activo);

      // Obtener los contenedores de cada categoría
      const librosDiv = document.getElementById("libros-container");
      const separadoresDiv = document.getElementById("separadores-container");

      // Función para renderizar todos los productos
      function renderizarProductos() {
        // Limpiar contenedores
        if (librosDiv) librosDiv.innerHTML = '';
        if (separadoresDiv) separadoresDiv.innerHTML = '';

        activos.forEach(prod => {
          const div = document.createElement("div");
          div.classList.add("producto", "card", "m-2", "p-2");

          // Obtener cantidad actual en el carrito
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

          // Efecto destacado al hacer hover
          div.addEventListener('mouseenter', () => {
            div.classList.add('destacado');
          });
          div.addEventListener('mouseleave', () => {
            div.classList.remove('destacado');
          });

          // Botón agregar al carrito
          div.querySelector('.btn-agregar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            actualizarCantidadCarrito();
            renderizarProductos(); // Vuelve a renderizar todos los productos para actualizar los badges
          });

          // Agregar el div al contenedor correspondiente
          if (prod.categoria === "libro" || prod.categoria === "comic" || prod.categoria === "manga"){
            librosDiv.appendChild(div);
          } else {
            separadoresDiv.appendChild(div);
          }
        });
      }
      
      renderizarProductos();
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