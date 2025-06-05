const mongoose = require('mongoose');

const conectarDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('❌ No se encontró la variable de entorno MONGO_URL');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  }
};

module.exports = conectarDB;