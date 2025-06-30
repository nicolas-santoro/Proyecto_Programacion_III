const mongoose = require('mongoose'); // Importa mongoose para conectar con MongoDB

// Función asíncrona para conectar a la base de datos
const conectarDB = async () => {
  const mongoUrl = process.env.MONGO_URL; // Obtiene la URL de conexión desde las variables de entorno

  // Validación: si no se encuentra la variable de entorno, mostrar error y detener la ejecución
  if (!mongoUrl) {
    console.error('❌ No se encontró la variable de entorno MONGO_URL');
    process.exit(1); // Salir del proceso con código 1 (error)
  }

  try {
    // Intentar conectar a la base de datos con la URL obtenida
    await mongoose.connect(mongoUrl);
    console.log('✅ Conectado a MongoDB'); // Confirmación exitosa
  } catch (error) {
    // En caso de error, mostrarlo y terminar el proceso para evitar que siga sin DB
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  }
};

module.exports = conectarDB; // Exporta la función para usarla desde otros archivos