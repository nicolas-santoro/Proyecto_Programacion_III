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
});

// Esta es la lógica para finalizar la compra del carrito y poder acceder al ticket
document.getElementById('formCompra').addEventListener('submit', async function(e) {
  e.preventDefault();

  const nombreCliente = localStorage.getItem('nombreUsuario') || 'Cliente'; // Obtiene el nombre del cliente del input en index.html
  const carrito = getCarrito(); // Obtiene el carrito del localStorage
  if (!nombreCliente || carrito.length === 0) {
    alert('Debe ingresar su nombre y tener productos en el carrito.'); // Validación del cliente
    return;
  }
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0); // Calcula el total del carrito
  const venta = { // Crea el objeto venta con los datos necesarios
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

  // Guardar en backend con un post
  try {
    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta)
    });

    if (!res.ok) throw new Error('Error al guardar la venta');

    // Guardar en localStorage para el ticket que se va a usar después
    localStorage.setItem('ticket', JSON.stringify(venta));
    localStorage.removeItem('carrito'); // Vacía el carrito

    // Redirigir a ticket.html
    window.location.href = '/html/ticket.html';
  } catch (err) {
    alert('No se pudo finalizar la compra. Intente de nuevo.');
  }
});