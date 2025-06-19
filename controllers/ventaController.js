const Venta = require('../models/Venta');

// ✅ Crear venta (pueden usarlo usuarios "pasajeros")
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

// 🔍 Obtener todas las ventas (solo vendedores o admins)
exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 }); // ordena por fecha descendente
    res.status(200).json({ data: ventas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// 📅 Obtener ventas por rango de fechas
exports.obtenerVentasPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes proporcionar fechaInicio y fechaFin en el query' });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Validar fechas
    if (isNaN(inicio) || isNaN(fin)) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    const ventas = await Venta.find({
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    }).sort({ fecha: -1 });

    return res.status(200).json({ data: ventas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener ventas por rango' });
  }
};