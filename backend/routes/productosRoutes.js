const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta pública - Todos pueden ver productos
router.get('/obtener', productoController.obtenerProductos);

// Ruta protegida - Obtener producto específico por ID
router.get('/:id', verifyToken, productoController.obtenerProductoPorId);

module.exports = router;