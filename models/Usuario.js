const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'editor', 'vendedor', 'auditor'],
    required: true
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
