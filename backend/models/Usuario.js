const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// anntes de guardar la contraseña, se la encripta la contraseña si fue modificada
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Método para validad la contraseña
usuarioSchema.methods.validPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);