const Venta = require('../models/Venta');

exports.crearVenta = async (req, res) => {
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
};