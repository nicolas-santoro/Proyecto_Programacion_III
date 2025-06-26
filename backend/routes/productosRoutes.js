const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/verificarRol');
const productoController = require('../controllers/productoController');

// Todos los usuarios pueden ver los productos
router.get('/obtener', productoController.obtenerProductos);

// Solo los editores y los administradores pueden crear, editar, borrar o restaurar productos
router.get('/buscar', verifyToken, checkRole('editor', 'vendedor'), productoController.buscarProducto);
router.post('/crear', verifyToken, checkRole('editor'), productoController.crearProducto);
router.put('/modificar', verifyToken, checkRole('editor'), productoController.modificarProducto);
router.delete('/borrar', verifyToken, checkRole('editor'), productoController.borrarProducto);
router.put('/recuperar', verifyToken, checkRole('editor'), productoController.recuperarProducto);

module.exports = router;