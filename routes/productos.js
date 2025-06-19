const express = require('express');
const router = express.Router();
//const {verifyToken} = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/verificarRol');
const productoController = require('../controllers/productoController');

// Todos los usuarios pueden ver los productos
router.get('/', productoController.obtenerProductos);

// Solo los editores y los administradores pueden crear, editar, borrar o restaurar productos
router.get('/search', checkRole('editor', 'vendedor'), productoController.buscarProducto);
router.post('/', checkRole('editor'), productoController.crearProducto);
router.put('/:id', checkRole('editor'), productoController.modificarProducto);
router.delete('/:id', checkRole('editor'), productoController.borrarProducto);
router.put('/:id/restore', checkRole('editor'), productoController.recuperarProducto);

module.exports = router;