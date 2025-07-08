/**
 * CONFIGURACIÓN DE BASE DE DATOS MONGODB
 * 
 * Este módulo se va a encargar de establecer y gestionar la conexión con la base de datos MongoDB
 * utilizando Mongoose como ODM (Object Document Mapper)
 * Va a tener:
 * - Conexión asíncrona a MongoDB
 * - Validación de variables de entorno
 * - Manejo robusto de errores
 * - Terminación segura del proceso en caso de fallo
 * 
 * @fileoverview Configuración y conexión a la base de datos MongoDB
 * @author Hachis Parmentier
 * @version 1.0.0
 */

const mongoose = require('mongoose'); // Importa mongoose para conectar con MongoDB

/**
 * Establece la conexión con la base de datos MongoDB
 * 
 * Esta función asíncrona maneja todo el proceso de conexión a MongoDB:
 * 1. Valida que exista la variable de entorno MONGO_URL
 * 2. Intenta establecer la conexión usando Mongoose
 * 3. Proporciona feedback visual del estado de la conexión
 * 4. Maneja errores de forma robusta terminando el proceso si es necesario
 * 
 * @async
 * @function conectarDB
 * @returns {Promise<void>} Promise que se resuelve cuando la conexión se establece exitosamente
 * @throws {Error} Lanza error y termina el proceso si:
 *   - No se encuentra la variable de entorno MONGO_URL
 *   - Falla la conexión a MongoDB
 * 
 * @example
 * // Uso típico en el servidor principal
 * const conectarDB = require('./backend/config/database');
 * 
 * conectarDB().then(() => {
 *   console.log('Base de datos conectada, iniciando servidor...');
 *   app.listen(3000);
 * });
 */
const conectarDB = async () => {
  // Paso 1: se obtiene la URL de conexión desde las variables de entorno, esta URL debe estar definida en el archivo .env como MONGO_URL
  const mongoUrl = process.env.MONGO_URL;

  // Paso 2: Validación de la variable de entorno, sin la URL de MongoDB, la aplicación no puede funcionar correctamente
  if (!mongoUrl) {
    console.error('No se encontró la variable de entorno MONGO_URL');
    console.error('Asegúrate de tener un archivo .env con la variable MONGO_URL definida');
    process.exit(1); // Salir del proceso con código 1 (indica error crítico)
  }

  try {
    // Paso 3: Intentar establecer la conexión con MongoDB, mongoose.connect() retorna una Promise que se resuelve cuando la conexión es exitosa
    await mongoose.connect(mongoUrl);
    
    // Paso 4: Confirmación visual de conexión exitosa
    console.log('✅ Conectado a MongoDB exitosamente');    
  } catch (error) {
    // Paso 5: Manejo de errores de conexión, si la conexión falla, la aplicación no puede continuar funcionando
    console.error('❌ Error al conectar con la base de datos MongoDB');
    console.error('Detalles del error:', error.message);
    console.error('Verifica que:');
    console.error('   - La URL de MongoDB sea correcta');
    console.error('   - El servicio de MongoDB esté ejecutándose');
    console.error('   - Las credenciales sean válidas');
    console.error('   - La red permita la conexión');
    
    // Terminar el proceso para evitar que la aplicación continúe sin base de datos
    process.exit(1);
  }
};

/**
 * Exportación del módulo
 * 
 * Se exporta la función conectarDB para que pueda ser importada y utilizada
 * desde otros archivos del proyecto, principalmente desde server.js
 */
module.exports = conectarDB; // Exporta la función para usarla desde otros archivos