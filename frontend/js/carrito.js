function getCarrito() { // Obtiene el carrito del localStorage
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function setCarrito(carrito) { // Guarda el carrito en el localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function renderCarrito() { // Renderiza el carrito en la tabla
  const carrito = getCarrito();
  const tbody = document.getElementById('carrito-body');
  tbody.innerHTML = ''; // Limpia el contenido del tbody
  if (carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">El carrito está vacío</td></tr>';
    document.getElementById('carrito-total').textContent = '$0';
    return;
  }
  let total = 0; 

  carrito.forEach((prod, i) => {
    const subtotal = prod.precio * prod.cantidad;
    total += subtotal;
    const tr = document.createElement('tr'); // Crea una nueva fila para el producto
    // Ejemplo para tu función renderCarrito en carrito.js
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
    tbody.appendChild(tr); // Agrega la fila al tbody
  });

  document.getElementById('carrito-total').textContent = `$${total}`;
}
// Para los clicks dentro del carrito
document.addEventListener('DOMContentLoaded', () => {
  renderCarrito(); // Renderiza el carrito al cargar la página
    document.getElementById('carrito-body').addEventListener('click', (e) => {
    let btn = e.target; // Si el click fue en un ícono <i>, subí al botón padre <button>
    if (btn.tagName === 'I') { // tagmame es para saber el nombre de la etiqueta HTML -- es una propiedad de los elementos HTML
        btn = btn.closest('button'); // busca el botón padre más cercano al "I" usando closest --que busca el padre que coincida con el botón más cercano--
    }
    if (!btn) return; // Si no hay botón, salimos

    const carrito = getCarrito(); // Obtiene el carrito actual del localStorage 
    const i = btn.dataset.i; // Obtiene el índice del producto en el carrito desde el atributo data-i del botón

    if (btn.classList.contains('btn-sumar')) {
        carrito[i].cantidad++;
        setCarrito(carrito);
        renderCarrito();
    }
    if (btn.classList.contains('btn-restar')) {
        if (carrito[i].cantidad > 1) carrito[i].cantidad--;
        setCarrito(carrito);
        renderCarrito();
    }
    if (btn.classList.contains('btn-eliminar')) {
        carrito.splice(i, 1);
        setCarrito(carrito);
        renderCarrito();
    }
    });

  cancelarCompra(); //Habilita la posibilidad de cancelar la compra
});

// Obtenemos los elementos
const formCompra = document.getElementById('formCompra');
const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
const btnConfirmarCompra = document.getElementById('btnConfirmarCompra');

formCompra.addEventListener('submit', function(e) {
  e.preventDefault();
  modalConfirmacion.show(); // Mostrar el modal de confirmación
});

// Ahora la lógica de la compra la ejecutamos al presionar el botón "Sí"
btnConfirmarCompra.addEventListener('click', async function() {
  const nombreCliente = localStorage.getItem('nombreUsuario') || 'Cliente';
  const carrito = getCarrito();

  if (!nombreCliente || carrito.length === 0) {
    mostrarAlerta('Debe ingresar su nombre y tener productos en el carrito...', 'danger');
    modalConfirmacion.hide();
    return;
  }

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

  try {
    const data = await ApiClient.fetchApi('/ventas/crear', {
      method: 'POST',
      body: JSON.stringify(venta)
    });

    if (!data || data.error) {
      throw new Error(data.error || 'Error al guardar la venta');
    }

    localStorage.setItem('ticket', JSON.stringify(venta));
    localStorage.removeItem('carrito');

    // Cierra el modal y redirige
    document.activeElement.blur();
    modalConfirmacion.hide();
    window.location.href = '/html/ticket.html';
  } catch (err) {
    mostrarAlerta('No se pudo finalizar la compra. Intente de nuevo.', 'danger');
    modalConfirmacion.hide();
  }
});

import { mostrarAlerta } from './alertas.js';
import { cancelarCompra } from './cancelar.js';