const express = require('express');
const router = express.Router(); // Importamos express y creamos un router
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');

router.post('/productos', async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ mensaje: ' ✅ Producto guardado con éxito' });
  } catch (error) {
    res.status(500).json({ error: ' ❌ Error al guardar producto' });
  }
});

router.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: '❌ Error al obtener productos' });
  }
});

router.post('/ventas', async (req, res) => {
  try {
    const nuevaVenta = new Venta({
      nombreCliente: req.body.nombreCliente,
      productos: req.body.productos,
      total: req.body.total,
      fecha: req.body.fecha || new Date()
    });
    await nuevaVenta.save();
    res.status(201).json({ mensaje: 'Venta guardada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la venta' });
  }
});

module.exports = router;