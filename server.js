require('dotenv').config(); // para cargar las variables de entorno desde el archivo .env
const express = require('express'); // para crear el servidor
const app = express(); // lo declaramos en una app crear una instancia de express
const conectarDB = require('./config/database'); // para conectar a la base de datos
const cors = require('cors'); // para permitir solicitudes desde otros orígenes

app.use(cors()); // es para que el frontend aunque esté en otro puerto le pueda hacer peticiones al backend

// Middlewares
app.use(express.json()); // IMPORTANTE: para leer JSON del body
app.use(express.static('public')); // <-- ESTA LÍNEA es clave

// Rutas CRUD
app.use('/api', require('./routes/api'));


app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Hachis Parmentier');
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});

conectarDB();