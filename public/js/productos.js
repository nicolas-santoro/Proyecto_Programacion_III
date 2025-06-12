document.addEventListener('DOMContentLoaded', () => {
  fetch("http://localhost:3000/api/productos") // Trae los productos desde la API 
    .then(res => res.json())
    .then(productos => {
      const activos = productos.filter(p => p.activo); // filtra solo los productos activos y los ordena alfabéticamente por nombre

      activos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // va a agarrar los contenedores de botones y productos por categoría
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
        contenedor.innerHTML = ''; // hay que limpiar el contenedor antes de poder renderizarlo

        productos.forEach(prod => {
          const div = document.createElement("div");
          div.classList.add("producto", "card", "m-2", "p-2");

          // tiene que saber la cantidad actual del producto que hay en el carrito
          const carrito = getCarrito();
          const itemEnCarrito = carrito.find(p => p._id === prod._id); // va a buscar dentro del array del carrito si ya existe un producto con el mismo id
          const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0; // si lo encuentra, va a devolver ese producto, sino, su cantidad es 0 

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

          // toma el div de la cantidad de productos y el container del boton agregar
          const controlDiv = div.querySelector('.control-cantidad');
          const agregarDiv = div.querySelector('.boton-agregar-container');

          // Evento del botón sumar [+]
          controlDiv.querySelector('.btn-sumar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            const nuevaCantidad = getCantidadEnCarrito(prod._id); // va a obtener una nueva cantidad
            controlDiv.querySelector('.cantidad-text').textContent = nuevaCantidad; // actualiza el numero que se muestra en la pantalla
            actualizarCantidadCarrito(); 
            actualizarBadge(div, nuevaCantidad); // actualiza el badge (circulito) con la cantidad actual del producto
          });

          // Evento del boton restar [-]
          controlDiv.querySelector('.btn-restar').addEventListener('click', () => {
            restarDelCarrito(prod._id);
            const nuevaCantidad = getCantidadEnCarrito(prod._id);
            if (nuevaCantidad <= 0) { // si la cantidad llega a 0
              controlDiv.classList.add('d-none'); // oculta el div de control de cantidad
              agregarDiv.classList.remove('d-none'); // muestra el div de agregar al carrito
              actualizarBadge(div, 0); // elimina el badge de cantidad
            } else {
              controlDiv.querySelector('.cantidad-text').textContent = nuevaCantidad; // si sigue siendo mayor a 0, actualiza el número
              actualizarBadge(div, nuevaCantidad);
            }
            actualizarCantidadCarrito();
          });

          // Evento del botón para eliminar [X]
          controlDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
            quitarDelCarrito(prod._id); // quita el producto
            controlDiv.classList.add('d-none'); // oculta los controles de cantidad
            agregarDiv.classList.remove('d-none'); // muestra el botón de agregar al carrito
            actualizarBadge(div, 0);
            actualizarCantidadCarrito();
          });

          // Evento del botón para agregar ["Agregar al Carrito"]
          div.querySelector('.btn-agregar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            controlDiv.classList.remove('d-none'); 
            agregarDiv.classList.add('d-none');
            controlDiv.querySelector('.cantidad-text').textContent = getCantidadEnCarrito(prod._id);
            actualizarBadge(div, getCantidadEnCarrito(prod._id));
            actualizarCantidadCarrito();
          });

          // va a tomar el contenedor y agregar la tarjeta del producto al contenedor correspondiente
          contenedor.appendChild(div);
        });
      }

      // Actualiza el badge (circulito) con la cantidad actual de un producto
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

      // Renderiza productos según la categoría seleccionada (para separarlos)
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

      // Maneja el click en los botones de categorías
      botonesDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          botonesDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          categoriaActual = e.target.dataset.categoria;
          renderizarProductosPorCategoria(categoriaActual);
        }
      });

      // Inicialización: muestra todos los productos y separadores al cargar la página
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
function getCarrito() { // así lee el carrito del localStorage y lo devuelve como un array
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function setCarrito(carrito) { // para guardar el array que se tomó arriba en un localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) { // va a sumar un producto al carrito o aumentar la cantidad si ya existe
  let carrito = getCarrito();
  const index = carrito.findIndex(p => p._id === producto._id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else { // si no existe, lo agrega con cantidad 1
    carrito.push({
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
  setCarrito(carrito); // actualiza el localStorage con el carrito modificado
}

function restarDelCarrito(id) { // resta una unidad
  let carrito = getCarrito();
  const index = carrito.findIndex(p => p._id === id); // busca el índice del producto en el carrito por su id -- comparando
  if (index !== -1) { // si existe en el carrito, le resta 1
    if (carrito[index].cantidad > 1) {
      carrito[index].cantidad -= 1;
    } else {
      carrito.splice(index, 1); // si la cantidad es 1, lo elimina del carrito
    }
  }
  setCarrito(carrito);
}

function quitarDelCarrito(id) { // lo elimina del carrito 
  let carrito = getCarrito();
  carrito = carrito.filter(p => p._id !== id); // va a filtrar el carrito para eliminar el producto con el id que le pasamos
  setCarrito(carrito);
}

function actualizarCantidadCarrito() { // actualiza el contador de productos en el carrito
  const carrito = getCarrito();
  const cantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0); // usa reduce para sumar todas las cantidades de los productos en el carrito
  const span = document.getElementById('carrito-cantidad'); // busca el span que muestra la cantidad de productos en el carrito 
  if (span) span.textContent = cantidad; //   actualiza el texto del span con la cantidad total de productos en el carrito
}

function getCantidadEnCarrito(id) { // obtiene la cantidad de un producto específico en el carrito, esto se usa para mostrar en la vista de productos cuántas unidades de un producto ya hay
  const carrito = getCarrito();
  const item = carrito.find(p => p._id === id); // busca el producto en el carrito por su id, donde los dos id sean iguales
  return item ? item.cantidad : 0;
}