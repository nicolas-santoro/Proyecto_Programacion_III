const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({ 
  nombre: { type: String, required: true },
  precio: { type: Number, required: true }, 
  categoria: { 
    type: String, 
    enum: ['comic', 'libro', 'manga', 'separador'],
    required: true 
  },
  activo: { type: Boolean, default: true },
  imagen: String
});

module.exports = mongoose.model('Producto', productoSchema);