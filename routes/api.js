const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');
const ventaController = require('../controllers/ventaController');

// Productos
router.post('/productos', productoController.crearProducto);
router.get('/productos', productoController.obtenerProductos);

// Ventas
router.post('/ventas', ventaController.crearVenta);

module.exports = router;