const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  nombreCliente: { type: String, required: true },
  productos: [{
    id: String,
    nombre: String,
    precio: Number,
    cantidad: Number
  }],
  total: Number,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema);