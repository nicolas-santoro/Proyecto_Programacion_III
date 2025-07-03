const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const productoRoutes = require('./productosRoutes');
const ventaRoutes = require('./ventasRoutes');
const { verifyToken } = require('../middlewares/authMiddleware');
const productoController = require('../controllers/productoController');
const ventaController = require('../controllers/ventaController');
const auditoriaController = require('../controllers/auditoriaController');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite 5MB
});

router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);

// RUTAS DE ADMINISTRACIÓN (Solo Admin)
/*
router.get('/admin/usuarios', verifyToken, usuarioController.obtenerUsuarios);
router.post('/admin/usuarios', verifyToken, usuarioController.crearUsuario);
router.put('/admin/usuarios/:id', verifyToken, usuarioController.actualizarUsuario);
router.delete('/admin/usuarios/:id', verifyToken, usuarioController.eliminarUsuario); */

router.get('/admin/productos', verifyToken, productoController.obtenerTodosProductos);
router.get('/admin/productos/:id', verifyToken, productoController.obtenerProductoPorId);
router.post('/admin/productos', verifyToken, upload.single('imagen'), productoController.crearProducto);
router.put('/admin/productos/:id', verifyToken, upload.single('imagen'), productoController.actualizarProducto);
router.delete('/admin/productos/:id', verifyToken, productoController.borrarProducto);
router.patch('/admin/productos/:id/recuperar', verifyToken, productoController.recuperarProducto);

router.get('/admin/ventas', verifyToken, ventaController.obtenerVentas);
router.get('/admin/ventas/:id', verifyToken, ventaController.obtenerVentaPorId);

router.get('/admin/auditoria', verifyToken, auditoriaController.obtenerAcciones);

module.exports = router;
