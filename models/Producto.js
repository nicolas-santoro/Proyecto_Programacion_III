const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({ 
  nombre: String,
  precio: Number, 
  categoria: String, // "Comic, manga, libro, separador"
  activo: Boolean // para configurar si está disponible para la venta o no -sirve para productos descontinuados-
});

module.exports = mongoose.model('Producto', productoSchema);

fetch("http://localhost:3000/api/productos")
  .then(res => res.json())
  .then(productos => {
    const contenedor = document.getElementById("contenedor-productos");

    productos.forEach(prod => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${prod.nombre}</h3>
        <p>$${prod.precio}</p>
        <button onclick="agregarAlCarrito('${prod._id}', '${prod.nombre}', ${prod.precio})">Agregar</button>
      `;
      contenedor.appendChild(div);
    });
  });
