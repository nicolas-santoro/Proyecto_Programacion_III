// === FUNCIONES PARA GESTIÓN DEL CARRITO ===

/**
 * Obtiene el carrito desde localStorage (o devuelve uno vacío)
 * Si nunca compraste nada, te devuelve una bolsa vacía
 * 
 * @returns {Array} - Lista de productos en el carrito
 */
function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

/**
 * Guarda el carrito en localStorage
 * 
 * @param {Array} carrito - La lista de productos a guardar
 */
function setCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Renderiza el carrito en la tabla HTML
 * Esta función toma todos los productos del carrito y los muestra bonito en una tabla
 * 
 * Por cada producto hace una fila con:
 * - Nombre del producto
 * - Precio individual
 * - Botones para sumar/restar cantidad
 * - Subtotal (precio × cantidad)
 * - Botón para eliminar
 * 
 * También calcula y muestra el total general al final
 */
function renderCarrito() {
  const carrito = getCarrito();
  const tbody = document.getElementById('carrito-body');
  tbody.innerHTML = ''; // Limpia contenido previo

  // Si el carrito está vacío, se muestra mensaje
  if (carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">El carrito está vacío</td></tr>';
    document.getElementById('carrito-total').textContent = '$0';
    return;
  }

  let total = 0;

  // Crea filas por cada producto en el carrito
  carrito.forEach((prod, i) => {
    const subtotal = prod.precio * prod.cantidad;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${prod.nombre}</td>
        <td>$${prod.precio}</td>
        <td>
            <button class="btn btn-outline-light btn-sm btn-restar rounded-circle me-1" data-i="${i}" title="Restar">
            <i class="bi bi-dash"></i>
            </button>
            <span class="mx-2">${prod.cantidad}</span>
            <button class="btn btn-outline-light btn-sm btn-sumar rounded-circle ms-1" data-i="${i}" title="Sumar">
            <i class="bi bi-plus"></i>
            </button>
        </td>
        <td>$${subtotal}</td>
        <td>
            <button class="btn btn-gradient-pink btn-sm btn-eliminar rounded-pill px-3" data-i="${i}" title="Eliminar">
            <i class="bi bi-trash"></i> Eliminar
            </button>
        </td>
    `;
    tbody.appendChild(tr);
  });

  // Actualiza el total en el HTML
  document.getElementById('carrito-total').textContent = `$${total}`;
}

// === CONFIGURACIÓN INICIAL ===
document.addEventListener('DOMContentLoaded', () => {
  renderCarrito(); // Muestra el carrito al cargar

  /**
   * Manejo de eventos para botones dentro del carrito
   * Esta función escucha cuando haces clic en cualquier botón de la tabla del carrito
   * 
   * Dependiendo del botón que clickees hace:
   * - Botón [+]: suma 1 a la cantidad
   * - Botón [-]: resta 1 a la cantidad (mínimo 1)
   * - Botón "Eliminar": saca el producto completo del carrito
   * 
   * Después de cualquier cambio, vuelve a mostrar la tabla actualizada
   */
  document.getElementById('carrito-body').addEventListener('click', (e) => {
    let btn = e.target;

    // Si se hizo clic en un ícono <i>, busca el botón padre
    if (btn.tagName === 'I') {
      btn = btn.closest('button');
    }

    if (!btn) return;

    const carrito = getCarrito();
    const i = btn.dataset.i; // Índice del producto

    // Botón para sumar cantidad
    if (btn.classList.contains('btn-sumar')) {
      carrito[i].cantidad++;
      setCarrito(carrito);
      renderCarrito();
    }

    // Botón para restar cantidad (mínimo 1)
    if (btn.classList.contains('btn-restar')) {
      if (carrito[i].cantidad > 1) carrito[i].cantidad--;
      setCarrito(carrito);
      renderCarrito();
    }

    // Botón para eliminar producto
    if (btn.classList.contains('btn-eliminar')) {
      carrito.splice(i, 1);
      setCarrito(carrito);
      renderCarrito();
    }
  });

  cancelarCompra(); // Habilita botón de cancelación
});

// === CONFIRMACIÓN Y FINALIZACIÓN DE COMPRA ===

// Referencias al formulario y modal
const formCompra = document.getElementById('formCompra');
const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
const btnConfirmarCompra = document.getElementById('btnConfirmarCompra');

/**
 * Al enviar el formulario, mostramos el modal (no compramos todavía)
 * Es como decir "¿estás seguro de que quieres comprar todo esto?"
 * Todavía no se procesa la compra, solo se muestra la confirmación
 */
formCompra.addEventListener('submit', function(e) {
  e.preventDefault();
  modalConfirmacion.show();
});

/**
 * Al confirmar en el modal, se realiza la compra
 * Esta función se ejecuta cuando clickeas "Sí, confirmar compra" en el modal
 * 
 * Hace todo el proceso final:
 * 1. Agarra el nombre del cliente y los productos del carrito
 * 2. Calcula el total
 * 3. Arma el objeto de venta con toda la info
 * 4. Lo envía a la API del servidor
 * 5. Si todo sale bien: guarda el ticket, borra el carrito y te lleva al ticket
 * 6. Si algo falla: muestra un mensaje de error
 */
btnConfirmarCompra.addEventListener('click', async function() {
  const nombreCliente = localStorage.getItem('nombreUsuario') || 'Cliente';
  const carrito = getCarrito();

  // Validaciones
  if (!nombreCliente || carrito.length === 0) {
    mostrarAlerta('Debe ingresar su nombre y tener productos en el carrito...', 'danger');
    modalConfirmacion.hide();
    return;
  }

  // Arma el objeto de venta
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const venta = {
    nombreCliente,
    productos: carrito.map(p => ({
      id: p._id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad
    })),
    total,
    fecha: new Date().toISOString()
  };

  // Envía la venta a la API
  try {
    const data = await ApiClient.fetchApi('/ventas/crear', {
      method: 'POST',
      body: JSON.stringify(venta)
    });

    // Si la API devuelve error
    if (!data || data.error) {
      throw new Error(data.error || 'Error al guardar la venta');
    }

    // Guardamos el ticket y limpiamos el carrito
    localStorage.setItem('ticket', JSON.stringify(venta));
    localStorage.removeItem('carrito');

    // Cerramos modal y redirigimos al ticket
    document.activeElement.blur();
    modalConfirmacion.hide();
    window.location.href = '/html/ticket.html';
  } catch (err) {
    mostrarAlerta('No se pudo finalizar la compra. Intente de nuevo.', 'danger');
    modalConfirmacion.hide();
  }
});

// === IMPORTACIONES ===
import { mostrarAlerta } from './alertas.js';
import { cancelarCompra } from './cancelar.js';