require('dotenv').config(); // para cargar las variables de entorno desde el archivo .env
const express = require('express'); // para crear el servidor
const path = require('path'); // para manejar rutas de archivos
const app = express(); // lo declaramos en una app crear una instancia de express
const conectarDB = require('./backend/config/database'); // para conectar a la base de datos
const cors = require('cors'); // para permitir solicitudes desde otros orígenes

app.use(cors()); // es para que el frontend aunque esté en otro puerto le pueda hacer peticiones al backend

// Middlewares
app.use(express.json()); // IMPORTANTE: para leer JSON del body
app.use(express.urlencoded({ extended: true })); // Para formularios
app.use(express.static('frontend')); // Archivos estáticos (CSS, JS, imágenes)
app.use('/uploads', express.static('uploads')); // Para servir imágenes subidas

// Rutas API JSON
app.use('/api', require('./backend/routes/apiRoutes'));
app.use('/api/auth', require('./backend/routes/authRoutes'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'index.html'));
});

// RUTA TEMPORAL PARA VERIFICAR/CREAR USUARIO ADMIN
app.get('/crear-admin', async (req, res) => {
  try {
    const Usuario = require('./backend/models/Usuario');
    
    // Verificar si ya existe
    let admin = await Usuario.findOne({ email: 'admin@test.com' });
    
    if (admin) {
      return res.json({ 
        mensaje: 'Usuario admin ya existe',
        email: admin.email,
        rol: admin.rol 
      });
    }
    
    // Crear usuario admin
    admin = new Usuario({
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: 'admin123', // Se encriptará automáticamente
      rol: 'admin'
    });
    
    await admin.save();
    
    res.json({ 
      mensaje: 'Usuario admin creado exitosamente',
      email: admin.email,
      rol: admin.rol 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

conectarDB().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
  });
});