require('dotenv').config(); // Carga las variables de entorno definidas en el archivo .env

const express = require('express'); // Importa Express para crear el servidor web
const path = require('path'); // Utilidad para manejar rutas de archivos de forma segura y multiplataforma
const app = express(); // Crea una instancia de la aplicación Express
const conectarDB = require('./backend/config/database'); // Función para conectar a la base de datos MongoDB
const cors = require('cors'); // Middleware para permitir solicitudes cross-origin (CORS)

// Habilita CORS para que el frontend pueda hacer peticiones al backend desde otro origen (ej: otro puerto)
app.use(cors());

// Middlewares para interpretar datos entrantes
app.use(express.json()); // Permite recibir JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite interpretar datos enviados con formularios (application/x-www-form-urlencoded)

// Servir archivos estáticos (CSS, JS, imágenes) desde la carpeta 'frontend'
app.use(express.static('frontend'));

// Servir las imágenes subidas que estén en la carpeta 'uploads' bajo la ruta '/uploads'
app.use('/uploads', express.static('uploads'));

// Rutas principales de la API
app.use('/api', require('./backend/routes/apiRoutes')); // Rutas de recursos generales (productos, ventas, etc)
app.use('/api/authRoutes', require('./backend/routes/authRoutes')); // Rutas relacionadas a autenticación (login, registro)

// Ruta raíz que sirve el archivo index.html de la carpeta frontend/html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'index.html'));
});

// Ruta temporal para crear/verificar usuario administrador (solo para desarrollo)
// Usar solo una vez o con cuidado, para no crear múltiples admins
app.get('/crear-admin', async (req, res) => {
  try {
    const Usuario = require('./backend/models/Usuario'); // Importar modelo Usuario
    
    // Verificar si ya existe un usuario admin con ese email
    let admin = await Usuario.findOne({ email: 'admin@test.com' });
    
    if (admin) {
      // Si ya existe, devolver info sin crear otro
      return res.json({ 
        mensaje: 'Usuario admin ya existe',
        email: admin.email,
        rol: admin.rol 
      });
    }
    
    // Si no existe, crear un nuevo usuario admin con contraseña por defecto
    admin = new Usuario({
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: 'admin123', // La contraseña se encriptará automáticamente (según el modelo)
      rol: 'admin'
    });
    
    await admin.save(); // Guardar en la base de datos
    
    // Responder con éxito y datos del usuario creado
    res.json({ 
      mensaje: 'Usuario admin creado exitosamente',
      email: admin.email,
      rol: admin.rol 
    });
    
  } catch (error) {
    // Si hay error, responder con status 500 y mensaje del error
    res.status(500).json({ error: error.message });
  }
});

// Conectar a la base de datos y luego iniciar el servidor en el puerto 3000
conectarDB().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000/html/index.html');
  });
});