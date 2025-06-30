const Venta = require('../models/Venta');

// ➕ Crear venta (usuarios tipo "pasajero" pueden usarlo)
// Crea una nueva venta con los datos recibidos, asigna fecha actual si no viene
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
// Retorna todas las ventas ordenadas por fecha descendente
exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 }); 
    res.status(200).json({ data: ventas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// 📅 Obtener ventas filtradas por rango de fechas
// Recibe fechaInicio y fechaFin como query params, valida y busca en ese rango
exports.obtenerVentasPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debes proporcionar fechaInicio y fechaFin en el query' });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

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

// === MÉTODOS ADMINISTRATIVOS ===

// 🔍 Obtener venta por ID (solo admin/auditor)
// Busca venta por ID y registra la consulta en auditoría
exports.obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await Venta.findById(id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CONSULTAR_VENTA',
      detalles: `Usuario ${req.user.nombre} consultó venta ID: ${id}`
    });

    return res.status(200).json({ data: venta });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener venta' });
  }
};

// ✏️ Actualizar venta (solo admin)
// Actualiza campos de venta por ID, valida existencia y registra auditoría
exports.actualizarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;

    const venta = await Venta.findByIdAndUpdate(id, actualizaciones, { 
      new: true, 
      runValidators: true 
    });

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ACTUALIZAR_VENTA',
      detalles: `Usuario ${req.user.nombre} actualizó venta ID: ${id} - Cliente: ${venta.nombreCliente}`
    });

    return res.status(200).json({ 
      mensaje: 'Venta actualizada exitosamente',
      data: venta 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar venta' });
  }
};

// ❌ Eliminar venta (solo admin)
// Borra la venta por ID y registra auditoría
exports.eliminarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    const venta = await Venta.findById(id);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    await Venta.findByIdAndDelete(id);

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ELIMINAR_VENTA',
      detalles: `Usuario ${req.user.nombre} eliminó venta ID: ${id} - Cliente: ${venta.nombreCliente} - Total: $${venta.total}`
    });

    return res.status(200).json({ mensaje: 'Venta eliminada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar venta' });
  }
};

// 📊 Obtener estadísticas generales de ventas (solo admin/auditor)
// Devuelve total de ventas, ventas de hoy, monto total y venta más alta
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments();
    const ventasHoy = await Venta.countDocuments({
      fecha: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Totales en dinero
    const ventasTotales = await Venta.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const ventasHoyTotal = await Venta.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const ventaMasAlta = await Venta.findOne().sort({ total: -1 });

    const estadisticas = {
      totalVentas,
      ventasHoy,
      montoTotalVentas: ventasTotales[0]?.total || 0,
      montoVentasHoy: ventasHoyTotal[0]?.total || 0,
      ventaMasAlta
    };

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CONSULTAR_ESTADISTICAS_VENTAS',
      detalles: `Usuario ${req.user.nombre} consultó estadísticas generales`
    });

    return res.status(200).json({ data: estadisticas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// 📋 Obtener reporte detallado de ventas (solo admin/auditor)
// Opcionalmente filtra por rango de fechas, agrupa ventas por día y productos más vendidos
exports.obtenerReporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtroFecha = {};
    if (fechaInicio && fechaFin) {
      filtroFecha = {
        fecha: {
          $gte: new Date(fechaInicio),
          $lte: new Date(fechaFin)
        }
      };
    }

    // Ventas agrupadas por día
    const ventasPorDia = await Venta.aggregate([
      { $match: filtroFecha },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
          cantidad: { $sum: 1 },
          total: { $sum: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Productos más vendidos en el rango
    const productosMasVendidos = await Venta.aggregate([
      { $match: filtroFecha },
      { $unwind: "$productos" },
      {
        $group: {
          _id: "$productos.nombre",
          cantidad: { $sum: "$productos.cantidad" },
          total: { $sum: { $multiply: ["$productos.cantidad", "$productos.precio"] } }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 }
    ]);

    const reporte = {
      ventasPorDia,
      productosMasVendidos,
      periodo: { fechaInicio, fechaFin }
    };

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'GENERAR_REPORTE_VENTAS',
      detalles: `Usuario ${req.user.nombre} generó reporte de ventas ${fechaInicio ? `del ${fechaInicio} al ${fechaFin}` : 'completo'}`
    });

    return res.status(200).json({ data: reporte });
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar reporte' });
  }
};