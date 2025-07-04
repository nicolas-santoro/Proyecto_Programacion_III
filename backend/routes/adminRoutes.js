// Importar dependencias
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const productoController = require('../controllers/productoController');

// Rutas de administración de productos

// Ruta para obtener todos los productos
router.get('/productos', authMiddleware, productoController.obtenerProductos);

// Ruta para obtener un producto por ID
router.get('/productos/:id', authMiddleware, productoController.obtenerProductoPorId);

// Ruta para crear un nuevo producto
router.post('/productos', authMiddleware, productoController.crearProducto);

// Ruta para actualizar un producto existente
router.put('/productos/:id', authMiddleware, productoController.actualizarProducto);

// Ruta para desactivar (borrado suave) un producto
router.delete('/productos/:id', authMiddleware, productoController.eliminarProducto);

// Ruta para eliminar producto permanentemente - DEBE IR ANTES de las rutas genéricas
router.delete('/productos/:id/eliminar', authMiddleware, productoController.eliminarProductoPermanentemente);

// Ruta para reactivar un producto
router.patch('/productos/:id/recuperar', authMiddleware, productoController.reactivarProducto);

module.exports = router;