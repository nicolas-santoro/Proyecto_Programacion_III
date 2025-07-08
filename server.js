/**
 * SERVIDOR PRINCIPAL DE LA APLICACIÓN
 * Este archivo va a configura y ejecutar el servidor Express, que va a manejar:
 * - Autenticación de administradores
 * - Servir archivos estáticos del frontend
 * - APIs para productos, ventas y auditoría
 * - Protección de rutas administrativas
 */

require('dotenv').config(); // Carga las variables de entorno definidas en el archivo .env

// === IMPORTACIONES DE MÓDULOS ===
const express = require('express'); // Importa Express para crear el servidor web
const path = require('path'); // Utilidad para manejar rutas de archivos de forma segura y x multiplataforma
const app = express(); // Crea una instancia de la aplicación Express
const conectarDB = require('./backend/config/database'); // Función para conectar a la base de datos MongoDB
const cors = require('cors'); // Middleware para permitir solicitudes cross-origin (CORS)

// === CONFIGURACIÓN DE MIDDLEWARES GLOBALES ===
// Habilita CORS para que el frontend pueda hacer peticiones al backend desde otro origen (ej: otro puerto)
app.use(cors());
// Middlewares para interpretar datos entrantes en las peticiones HTTP
app.use(express.json()); // Permite recibir JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Permite interpretar datos enviados con formularios (application/x-www-form-urlencoded)

// === CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ===
// IMPORTANTE: Se sirven los archivos estáticos ANTES que las rutas protegidas
// Esto va a hacer  que CSS, JS e imágenes se carguen sin autenticación
app.use('/css', express.static(path.join(__dirname, 'frontend', 'css'))); // Archivos de estilos CSS
app.use('/js', express.static(path.join(__dirname, 'frontend', 'js'))); // Archivos JavaScript del frontend
app.use('/img', express.static(path.join(__dirname, 'frontend', 'img'))); // Imágenes de la aplicación
app.use('/uploads', express.static('uploads')); // Archivos subidos por usuarios (ej: imágenes de productos)
app.use('/html', express.static(path.join(__dirname, 'frontend', 'html'))); // Archivos HTML estáticos

// === CONFIGURACIÓN DE RUTAS DE API ===
app.use('/api', require('./backend/routes/apiRoutes')); // Rutas de recursos generales (productos, ventas, etc)
app.use('/api/authRoutes', require('./backend/routes/authRoutes')); // Rutas relacionadas a autenticación (login, registro)

// === RUTA PRINCIPAL ===
// Ruta raíz que sirve el archivo index.html de la carpeta frontend/html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', '/html/index.html'));
});

// Acá antes estaba la ruta temporal para crear/verificar usuario administrador (que se usó solo para desarrollo)

// === IMPORTACIÓN DE MIDDLEWARE DE AUTENTICACIÓN ===
// Importar middleware de autenticación para proteger rutas administrativas
const { verificarTokenAdminHTML } = require('./backend/middlewares/authMiddleware');

// === CONFIGURACIÓN DE RUTAS HTML CON PROTECCIÓN ===
// RUTA PÚBLICA: La página de login NO debe estar protegida para permitir el acceso inicial
app.get('/html/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-login.html'));
});
// === RUTAS PROTEGIDAS DEL PANEL ADMINISTRATIVO ===
// Todas estas rutas requieren autenticación válida mediante token JWT
// Dashboard principal del administrador - página de inicio del panel admin
app.get('/html/admin-dashboard.html', verificarTokenAdminHTML, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-dashboard.html'));
});
// Gestión de ventas - visualización y administración de ventas realizadas
app.get('/html/admin-ventas.html', verificarTokenAdminHTML, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-ventas.html'));
});
// Gestión de productos - listado, edición y eliminación de productos
app.get('/html/admin-productos.html', verificarTokenAdminHTML, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-productos.html'));
});
// Auditoría del sistema - logs y registros de actividades administrativas
app.get('/html/admin-auditoria.html', verificarTokenAdminHTML, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-auditoria.html'));
});
// Formulario para crear/editar productos - permite añadir nuevos productos o modificar existentes
app.get('/html/admin-form-producto.html', verificarTokenAdminHTML, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'html', 'admin-form-producto.html'));
});
// === INICIALIZACIÓN DEL SERVIDOR ===
// Conectar a la base de datos MongoDB y luego iniciar el servidor en el puerto 3000
conectarDB().then(() => {
  app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000/html/index.html');
  });
});