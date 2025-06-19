const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');
const ventaController = require('../controllers/ventaController');
const validarProducto = require('../middlewares/validarProducto');
const validarVenta = require('../middlewares/validarVenta');

// Productos
router.post('/productos', validarProducto, productoController.crearProducto);
router.get('/productos', productoController.obtenerProductos);

// Ventas
router.post('/ventas', validarVenta, ventaController.crearVenta);

module.exports = router;