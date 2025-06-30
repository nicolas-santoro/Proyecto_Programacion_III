const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Modelo para crear usuarios
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

// Antes de guardar la contraseña, se la encripta solo si fue modificada
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para validad la contraseña (comparando los datos de la BD con los ingresados)
usuarioSchema.methods.validPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método para generar Tóken JWT
usuarioSchema.methods.generarJWT = function() {
  return jwt.sign(
    { id: this._id, email: this.email, rol: this.rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = mongoose.model('Usuario', usuarioSchema);