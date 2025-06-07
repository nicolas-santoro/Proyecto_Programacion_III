document.addEventListener('DOMContentLoaded', function () {
  // Recuperamos el ticket del localStorage
  const ticketJSON = localStorage.getItem('ticket');
  if (!ticketJSON) {
    document.getElementById('ticket-container').innerHTML = '<p>No hay información de la compra.</p>';
    return;
  }

  const ticket = JSON.parse(ticketJSON);

  // Mostrar los datos del cliente y la fecha
  const fecha = new Date(ticket.fecha).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
  document.getElementById('cliente').textContent = ticket.nombreCliente;
  document.getElementById('fecha').textContent = fecha;
  document.getElementById('total').textContent = `$${ticket.total.toFixed(2)}`;

  // Mostrar los productos
  const productosContainer = document.getElementById('productos');
  ticket.productos.forEach(prod => {
    const prodElement = document.createElement('li');
    prodElement.textContent = `${prod.nombre} - $${prod.precio} x ${prod.cantidad}`;
    productosContainer.appendChild(prodElement);
  });

  // Lógica para descargar el PDF
  document.getElementById("btnDescargarPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cliente = document.getElementById("cliente").textContent;
    const fecha = document.getElementById("fecha").textContent;
    const total = document.getElementById("total").textContent;
    const productosList = Array.from(document.querySelectorAll("#productos li")).map(li => li.textContent);

    let y = 20; // posición vertical inicial

    doc.setFontSize(16);
    doc.text("Ticket de Compra", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 20, y);
    y += 7;
    doc.text(`Fecha: ${fecha}`, 20, y);
    y += 7;
    doc.text(`Total: ${total}`, 20, y);
    y += 10;

    doc.text("Productos:", 20, y);
    y += 7;
    productosList.forEach(producto => {
      doc.text(`- ${producto}`, 25, y);
      y += 7;
    });

    // Agregar el mensaje de agradecimiento
    y += 10; // espacio antes del mensaje
    doc.setFontSize(14);
    doc.setTextColor(148, 0, 211); // color violeta
    doc.text(`Merci d'avoir fait vos achats chez Hachis Parmentier !
            Somos Milena Rodríguez y Nicolás Santoro, ¡ojalá nos veamos de nuevo!
            `, 20, y);

    doc.save("reçu_d'achat.pdf");
  });
});