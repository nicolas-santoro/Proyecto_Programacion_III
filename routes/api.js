const express = require('express');
const router = express.Router(); // Importamos express y creamos un router

const Producto = require('../models/Producto');

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


module.exports = router;