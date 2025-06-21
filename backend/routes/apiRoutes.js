const express = require('express');
const router = express.Router();

const productoRoutes = require('./productosRoutes');
const ventaRoutes = require('./ventasRoutes');
//const validarProducto = require('../middlewares/validarProducto');
//const validarVenta = require('../middlewares/validarVenta');

router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);

module.exports = router;