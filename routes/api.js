const express = require('express');
const app = express();

const productoRoutes = require('./productos');
const ventaRoutes = require('./ventas');

app.use('/productos', productoRoutes);
app.use('/ventas', ventaRoutes);

module.exports = app;