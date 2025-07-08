// --- MAPEO DE PRODUCTOS CON NOMBRES DE ARCHIVO ESPECIALES ---
// Algunos productos tienen nombres de archivo distintos al normal
const productosEspeciales = {
  'spider-man-la-ultima-caceria-de-kraven': 'spider-man-la-ultima-caceria-de-kraven-60',
  'jojos-bizarre-adventure-steel-ball-run-vol-2': 'jojos-bizarre-adventure-steel-ball-run-vol-2',
  'el-senor-de-los-anillos-la-comunidad-del-anillo': 'el-senior-de-los-anillos-la-comunidad-del-anillo',
  'harry-potter-y-el-prisionero-de-azkaban': 'harry-potter-y-el-prisionero-de-askaban'
};

/**
 * Normaliza el nombre de un producto para generar un nombre de archivo válido.
 * Convierte a minúsculas, elimina caracteres especiales y reemplaza espacios con guiones.
 * @param {string} text - El texto del nombre del producto a normalizar
 * @returns {string} El nombre normalizado para usar como nombre de archivo
 */
function normalizeFileName(text) {
  const normalized = text.toLowerCase()
    .replace(/:/g, '')// quitar dos puntos
    .replace(/'/g, '')// quitar apóstrofes
    .replace(/\./g, '')             // quitar puntos
    .replace(/\s+/g, '-')           // espacios por guiones
    .replace(/[áàäâ]/g, 'a')        // normalizar acentos
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\-]/g, '');   // quitar caracteres especiales
  
  // Usar nombre especial si existe
  return productosEspeciales[normalized] || normalized;
}

// --- MAPEO DE CATEGORÍAS A TIPOS DE SEPARADORES ---
// Para mostrar imágenes separadoras según la categoría
const categoriaSeparadores = {
  'libro': 'arte',        // libros usan separador-arte.png
  'comic': 'arte',
  'manga': 'arte',
  'separador': 'arte',
  'otono': 'otonio',      // otono (sin ñ) -> archivo 'separador-otonio.png'
  'otoño': 'otonio'       // otoño (con ñ) mapeado igual
};

// --- LISTA DE IMÁGENES DISPONIBLES EN /img/ ---
// Para validar si la imagen existe y evitar 404
const imagenesDisponibles = [
  'civil-war-must-have.png',
  'demon-slayer-vol-8.png',
  'el-hobbit.png',
  'el-senior-de-los-anillos-la-comunidad-del-anillo.png',
  'harry-potter-y-el-prisionero-de-askaban.png',
  'harry-potter-y-la-piedra-filosofal.png',
  'HP_LOGO.png',
  'hunter-x-hunter-vol-17.png',
  'jojos-bizarre-adventure-steel-ball-run-vol-2.png',
  'naruto-vol-19.png',
  'separador-amor.png',
  'separador-animales.png',
  'separador-arte.png',
  'separador-deportes.png',
  'separador-flores.png',
  'separador-invierno.png',
  'separador-motivacion.png',
  'separador-musica.png',
  'separador-otono.png',
  'separador-primavera.png',
  'separador-verano.png',
  'separador-viajes.png',
  'spider-man-la-ultima-caceria-de-kraven-60.png',
  'superior-iron-man-infamous.png',
  'x-men-dias-del-futuro-pasado-must-have.png'
];

/**
 * Determina la URL de la imagen que debe mostrarse para un producto.
 * Busca primero una imagen específica del producto, luego una por categoría.
 * @param {Object} producto - El objeto producto con propiedades como imagen, nombre y categoria
 * @returns {string} La URL completa de la imagen a mostrar
 */
function getImageUrl(producto) {
  if (producto.imagen && producto.imagen !== 'null' && producto.imagen.trim() !== '') {
    // Normalizar barras invertidas a barras normales
    let imagenNormalizada = producto.imagen.replace(/\\/g, '/');
    
    // Si ya tiene ruta completa, se devuelve tal cual
    if (imagenNormalizada.startsWith('/uploads/') || imagenNormalizada.startsWith('/img/') || imagenNormalizada.startsWith('http')) {
      return imagenNormalizada;
    }
    
    // Extraer solo el nombre del archivo si viene con ruta
    let nombreArchivo = imagenNormalizada.includes('/') ? imagenNormalizada.split('/').pop() : imagenNormalizada;
    
    // Si el archivo está en la lista conocida, devolver ruta en /img/
    if (imagenesDisponibles.includes(nombreArchivo)) {
      return `/img/${nombreArchivo}`;
    }
    
    // Si no, asumir que es un archivo subido
    return `/uploads/${nombreArchivo}`;
  }
  
  // Si no tiene imagen definida, generar el nombre de archivo a partir del nombre del producto
  const nombreArchivo = normalizeFileName(producto.nombre);
  const archivoGenerado = `${nombreArchivo}.png`;
  
  // Verificar si ese archivo existe en /img/
  if (imagenesDisponibles.includes(archivoGenerado)) {
    return `/img/${archivoGenerado}`;
  }
  
  // Si no hay imagen específica, usar el separador por categoría (por defecto 'arte')
  const separadorCategoria = categoriaSeparadores[producto.categoria?.toLowerCase()] || 'arte';
  return `/img/separador-${separadorCategoria}.png`;
}

/**
 * Maneja el error cuando una imagen no se puede cargar.
 * Reemplaza la imagen fallida con el logo genérico de la aplicación.
 * @param {HTMLImageElement} imgElement - El elemento de imagen que falló al cargar
 * @param {Object} producto - El objeto producto asociado a la imagen
 */
function handleImageError(imgElement, producto) {
  const srcActual = imgElement.src;
  if (srcActual.includes('HP_LOGO.png')) {
    return; // Ya tiene logo genérico, no hacer nada más
  }
  imgElement.src = '/img/HP_LOGO.png';
  imgElement.onerror = null; // Evitar más intentos
}

// --- AL CARGAR LA PÁGINA ---
// Trae productos desde API y renderiza
document.addEventListener('DOMContentLoaded', () => {
  ApiClient.fetchApi('/productos/obtener', { method: 'GET' })
    .then(productos => {
      // Filtra solo activos y los ordena alfabéticamente
      const activos = productos.filter(p => p.activo);
      activos.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Referencias a contenedores de botones y productos
      const botonesDiv = document.querySelector('.botones-categorias');
      const contenedorLibros = document.getElementById('libros-container');
      const contenedorSeparadores = document.getElementById('separadores-container');

      // Renderizar botones de categorías
      if (botonesDiv) {
        botonesDiv.innerHTML = `
          <button class="btn btn-outline-primary me-2" data-categoria="todos">Todos</button>
          <button class="btn btn-outline-primary me-2" data-categoria="libro">Libros</button>
          <button class="btn btn-outline-primary me-2" data-categoria="comic">Cómics</button>
          <button class="btn btn-outline-primary me-2" data-categoria="manga">Mangas</button>
        `;
      }

      /**
       * Renderiza una lista de productos en el contenedor especificado.
       * Crea tarjetas HTML con imagen, precio y controles de carrito para cada producto.
       * @param {HTMLElement} contenedor - El elemento DOM donde se renderizarán los productos
       * @param {Array} productos - Array de objetos producto a renderizar
       */
      function renderizarProductos(contenedor, productos) {
        contenedor.innerHTML = ''; // limpiar contenedor

        productos.forEach(prod => {
          const div = document.createElement("div");
          div.classList.add("producto", "card", "m-2", "p-2");

          // Cantidad actual del producto en carrito
          const carrito = getCarrito();
          const itemEnCarrito = carrito.find(p => p._id === prod._id);
          const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

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

          // Manejo de error de imagen
          const imgElement = div.querySelector('img');
          if (imgElement) {
            imgElement.onerror = function() {
              handleImageError(this, prod);
            };
          }

          // Referencias a controles de cantidad y botón agregar
          const controlDiv = div.querySelector('.control-cantidad');
          const agregarDiv = div.querySelector('.boton-agregar-container');

          // Evento sumar [+]
          controlDiv.querySelector('.btn-sumar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            const nuevaCantidad = getCantidadEnCarrito(prod._id);
            controlDiv.querySelector('.cantidad-text').textContent = nuevaCantidad;
            actualizarCantidadCarrito();
            actualizarBadge(div, nuevaCantidad);
          });

          // Evento restar [-]
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

          // Evento eliminar [X]
          controlDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
            quitarDelCarrito(prod._id);
            controlDiv.classList.add('d-none');
            agregarDiv.classList.remove('d-none');
            actualizarBadge(div, 0);
            actualizarCantidadCarrito();
          });

          // Evento agregar al carrito (botón "Agregar al Carrito")
          div.querySelector('.btn-agregar').addEventListener('click', () => {
            agregarAlCarrito(prod);
            controlDiv.classList.remove('d-none');
            agregarDiv.classList.add('d-none');
            controlDiv.querySelector('.cantidad-text').textContent = getCantidadEnCarrito(prod._id);
            actualizarBadge(div, getCantidadEnCarrito(prod._id));
            actualizarCantidadCarrito();
          });

          /**
           * Actualiza el badge de cantidad que aparece sobre la tarjeta del producto.
           * Muestra u oculta el indicador visual de cantidad en el carrito.
           * @param {HTMLElement} div - El elemento div de la tarjeta del producto
           * @param {number} cantidad - La cantidad actual del producto en el carrito
           */
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

          // Agregar producto al contenedor
          contenedor.appendChild(div);
        });
      }

      let categoriaActual = 'todos';

      /**
       * Filtra y renderiza productos según la categoría seleccionada.
       * Excluye los productos de tipo 'separador' que tienen su propio contenedor.
       * @param {string} categoria - La categoría a filtrar ('todos', 'libro', 'comic', 'manga')
       */
      function renderizarProductosPorCategoria(categoria) {
        let filtrados;
        if (categoria === 'todos') {
          filtrados = activos.filter(p => p.categoria !== 'separador');
        } else {
          filtrados = activos.filter(p => p.categoria === categoria);
        }
        renderizarProductos(contenedorLibros, filtrados);
      }

      /**
       * Renderiza únicamente los productos de tipo 'separador' en su contenedor específico.
       * Los separadores son elementos decorativos que se muestran por separado.
       */
      function renderizarSeparadores() {
        const separadores = activos.filter(p => p.categoria === 'separador');
        renderizarProductos(contenedorSeparadores, separadores);
      }

      // Esta función maneja cuando hago clic en los botones de categoría
      // Cambia qué productos se muestran según el filtro elegido
      botonesDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          botonesDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          categoriaActual = e.target.dataset.categoria;
          renderizarProductosPorCategoria(categoriaActual);
        }
      });

      // Inicialización al cargar la página: muestra todos los productos y separadores
      botonesDiv.querySelector('button[data-categoria="todos"]').classList.add('active');
      renderizarProductosPorCategoria(categoriaActual);
      renderizarSeparadores();
      actualizarCantidadCarrito();

      cancelarCompra(); // habilita botón de cancelar compra
    })
    .catch(error => console.error('Error al cargar los productos:', error));
});

// --- FUNCIONES DE CARRITO ---

/**
 * Obtiene el carrito de compras almacenado en localStorage.
 * @returns {Array} Array de objetos representando los productos en el carrito
 */
function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

/**
 * Guarda el carrito de compras en localStorage.
 * @param {Array} carrito - Array de objetos producto a guardar en el carrito
 */
function setCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 * @param {Object} producto - El objeto producto a agregar al carrito
 */
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

/**
 * Reduce la cantidad de un producto en el carrito o lo elimina si llega a 0.
 * @param {string} id - El ID del producto a reducir en el carrito
 */
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

/**
 * Elimina completamente un producto del carrito sin importar su cantidad.
 * @param {string} id - El ID del producto a eliminar del carrito
 */
function quitarDelCarrito(id) {
  let carrito = getCarrito();
  carrito = carrito.filter(p => p._id !== id);
  setCarrito(carrito);
}

/**
 * Actualiza el indicador visual de cantidad total en el ícono del carrito.
 * Calcula la suma de todos los productos en el carrito y actualiza el badge.
 */
function actualizarCantidadCarrito() {
  const carrito = getCarrito();
  const cantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
  const span = document.getElementById('carrito-cantidad');
  if (span) span.textContent = cantidad;
}

/**
 * Obtiene la cantidad específica de un producto en el carrito.
 * @param {string} id - El ID del producto a consultar
 * @returns {number} La cantidad del producto en el carrito (0 si no está)
 */
function getCantidadEnCarrito(id) {
  const carrito = getCarrito();
  const item = carrito.find(p => p._id === id);
  return item ? item.cantidad : 0;
}

import { cancelarCompra } from './cancelar.js';