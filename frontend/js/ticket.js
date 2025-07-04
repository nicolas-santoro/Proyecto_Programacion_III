document.addEventListener('DOMContentLoaded', function () {
  // Verificar si el usuario tiene nombre guardado antes de mostrar el ticket
  const nombreUsuario = localStorage.getItem('nombreUsuario');
  if (!nombreUsuario || nombreUsuario.trim() === '') {
    window.location.href = '/html/index.html';
    return;
  }

  // Recuperamos el ticket de compra almacenado en localStorage (JSON)
  const ticketJSON = localStorage.getItem('ticket');

  // Si no hay ticket, mostramos un mensaje y detenemos la ejecución
  if (!ticketJSON) {
    document.getElementById('ticket-container').innerHTML = '<p>No hay información de la compra.</p>';
    return;
  }

  // Convertimos el string JSON a objeto JavaScript
  const ticket = JSON.parse(ticketJSON);

  // Formateamos la fecha para mostrarla en formato local argentino, corto y con hora
  const fecha = new Date(ticket.fecha).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  // Mostramos los datos básicos del ticket: cliente, fecha y total
  document.getElementById('cliente').textContent = ticket.nombreCliente;
  document.getElementById('fecha').textContent = fecha;
  document.getElementById('total').textContent = `$${ticket.total.toFixed(2)}`;

  // Seleccionamos el contenedor donde listaremos los productos comprados
  const productosContainer = document.getElementById('productos');

  // Por cada producto en el ticket, creamos un <li> con su info y lo agregamos al contenedor
  ticket.productos.forEach(prod => {
    const prodElement = document.createElement('li');
    prodElement.textContent = `${prod.nombre} - $${prod.precio} x ${prod.cantidad}`;
    productosContainer.appendChild(prodElement);
  });

  // Configuramos el evento para descargar el ticket en formato PDF al hacer click en el botón
  document.getElementById("btnDescargarPDF").addEventListener("click", () => {
    // Simple print function instead of complex PDF generation
    window.print();
  });

  // Botón finalizar compra (para limpiar limpiar datos y volver al inicio)
  const btnFinalizar = document.getElementById('btn-finalizar');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      // Limpiar localStorage y redirigir al inicio
      localStorage.clear()
      window.location.href = '/html/index.html';
    })
  }

  // Borrar el nombre del usuario después de mostrar el ticket (compra completada)
  localStorage.removeItem('nombreUsuario');
});