// Mapeo específico de productos que tienen nombres de archivo diferentes
const productosEspeciales = {
  'spider-man-la-ultima-caceria-de-kraven': 'spider-man-la-ultima-caceria-de-kraven-60',
  'jojos-bizarre-adventure-steel-ball-run-vol-2': 'jojos-bizarre-adventure-steel-ball-run-vol-2',
  'el-senor-de-los-anillos-la-comunidad-del-anillo': 'el-senior-de-los-anillos-la-comunidad-del-anillo',
  'harry-potter-y-el-prisionero-de-azkaban': 'harry-potter-y-el-prisionero-de-askaban'
};

// Función para normalizar nombres de archivos
function normalizeFileName(text) {
  const normalized = text.toLowerCase()
    .replace(/:/g, '')              // quitar dos puntos
    .replace(/'/g, '')              // quitar apóstrofes
    .replace(/\./g, '')             // quitar puntos
    .replace(/\s+/g, '-')           // espacios por guiones
    .replace(/[áàäâ]/g, 'a')        // normalizar acentos
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\-]/g, '');   // quitar caracteres especiales
  
  // Verificar si hay un mapeo específico para este producto
  return productosEspeciales[normalized] || normalized;
}

// Mapeo de categorías a separadores disponibles
const categoriaSeparadores = {
  'libro': 'arte',        // libro -> separador-arte.png
  'comic': 'arte',        // comic -> separador-arte.png
  'manga': 'arte',        // manga -> separador-arte.png
  'separador': 'arte',    // separador -> separador-arte.png
  'otono': 'otonio',      // otono -> separador-otonio.png (nombre correcto del archivo)
  'otoño': 'otonio'       // otoño -> separador-otonio.png
};

// Función para obtener la URL correcta de la imagen con fallbacks inteligentes
function getImageUrl(producto) {
  // Si tiene imagen subida por el usuario, priorizarla
  if (producto.imagen && producto.imagen !== 'null') {
    // Si ya tiene la ruta completa, devolverla
    if (producto.imagen.startsWith('/uploads/') || producto.imagen.startsWith('http')) {
      return producto.imagen;
    }
    // Si solo tiene el nombre del archivo, agregar la ruta /uploads/
    return `/uploads/${producto.imagen}`;
  }
  
  // Si no tiene imagen subida, buscar imagen por defecto basada en el nombre del producto
  const nombreArchivo = normalizeFileName(producto.nombre);
  return `/img/${nombreArchivo}.png`;
}

// Función para manejar fallback de separadores
function handleSeparadorFallback(imgElement, categoria) {
  const categoriaLower = categoria.toLowerCase();
  
  // Buscar separador específico o usar mapeo
  const separadorNombre = categoriaSeparadores[categoriaLower] || categoriaLower;
  
  imgElement.src = `/img/separador-${separadorNombre}.png`;
  
  imgElement.onerror = function() {
    // Si falla el separador mapeado, probar con separador genérico "arte"
    if (separadorNombre !== 'arte') {
      this.src = '/img/separador-arte.png';
      this.onerror = function() {
        this.src = '/img/HP_LOGO.png';
        this.onerror = null;
      };
    } else {
      this.src = '/img/HP_LOGO.png';
      this.onerror = null;
    }
  };
}

// Función mejorada para manejar errores de carga de imágenes
function handleImageError(imgElement, producto) {
  const srcActual = imgElement.src;
  
  // Si falló una imagen de uploads, probar con imagen específica del producto
  if (srcActual.includes('/uploads/')) {
    const nombreArchivo = normalizeFileName(producto.nombre);
    imgElement.src = `/img/${nombreArchivo}.png`;
    imgElement.onerror = function() {
      // Si también falla, probar con separador de categoría
      handleSeparadorFallback(this, producto.categoria);
    };
  }
  // Si falló una imagen específica del producto, probar separador
  else if (srcActual.includes('/img/') && !srcActual.includes('separador-') && !srcActual.includes('HP_LOGO')) {
    handleSeparadorFallback(imgElement, producto.categoria);
  }
  // Si falló un separador, usar logo genérico
  else if (srcActual.includes('separador-')) {
    imgElement.src = '/img/HP_LOGO.png';
    imgElement.onerror = null;
  }
  // Último recurso
  else {
    imgElement.src = '/img/HP_LOGO.png';
    imgElement.onerror = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ApiClient.fetchApi('/productos/obtener', 
    { method: 'GET' }) // Trae los productos desde la API 
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
              <img src="${getImageUrl(prod)}" class="card-img-top mb-2" alt="${prod.nombre}">
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

          // Agregar el manejador de errores de imagen después de crear el HTML
          const imgElement = div.querySelector('img');
          if (imgElement) {
            imgElement.onerror = function() {
              handleImageError(this, prod);
            };
          }

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

      cancelarCompra(); //Habilita la posibilidad de cancelar la compra
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

import { cancelarCompra } from './cancelar.js';