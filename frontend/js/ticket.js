document.addEventListener('DOMContentLoaded', function () {
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
    const { jsPDF } = window.jspdf; // Obtenemos la clase jsPDF del plugin cargado
    const doc = new jsPDF(); // Creamos un nuevo documento PDF

    // Obtenemos los textos ya mostrados en pantalla para incluirlos en el PDF
    const cliente = document.getElementById("cliente").textContent;
    const fecha = document.getElementById("fecha").textContent;
    const total = document.getElementById("total").textContent;
    // Creamos una lista con los productos obteniendo el texto de cada <li>
    const productosList = Array.from(document.querySelectorAll("#productos li")).map(li => li.textContent);

    let y = 20; // Posición vertical inicial en el PDF

    // Título principal del ticket
    doc.setFontSize(16);
    doc.text("Ticket de Compra", 20, y);
    y += 10;

    // Información del cliente, fecha y total
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 20, y);
    y += 7;
    doc.text(`Fecha: ${fecha}`, 20, y);
    y += 7;
    doc.text(`Total: ${total}`, 20, y);
    y += 10;

    // Listado de productos comprados
    doc.text("Productos:", 20, y);
    y += 7;
    productosList.forEach(producto => {
      doc.text(`- ${producto}`, 25, y);
      y += 7;
    });

    // Mensaje de agradecimiento personalizado en color violeta
    y += 10; // espacio antes del mensaje
    doc.setFontSize(14);
    doc.setTextColor(148, 0, 211); // color violeta RGB
    doc.text(`Merci d'avoir fait vos achats chez Hachis Parmentier!
              Somos Milena Rodríguez y Nicolás Santoro, ¡ojalá nos veamos de nuevo!`, 20, y);

    // Guardamos el PDF con un nombre en francés
    doc.save("reçu_d'achat.pdf");
  });
});