const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
