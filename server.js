 require('dotenv').config(); // para cargar las variables de entorno desde el archivo .env
const express = require('express'); // para crear el servidor
const app = express(); // lo declaramos en una app crear una instancia de express
const conectarDB = require('./config/database'); // para conectar a la base de datos
const router = express.Router(); // para definir las rutas

// Rutas CRUD
// Create - Read ñ- Update - Delete

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API!');
});

app.use(router);
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});

conectarDB();