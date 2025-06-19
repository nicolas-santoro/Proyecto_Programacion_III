const express = require('express');
const router = express.Router();

const productoRoutes = require('./productos');
const ventaRoutes = require('./ventas');

router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);

module.exports = router;