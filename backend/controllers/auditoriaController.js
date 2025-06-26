const Acciones = require('../models/Acciones');

//  Obtener todas las acciones - Solo admin/auditor
exports.obtenerAcciones = async (req, res) => {
  try {
    const { page = 1, limit = 50, accion, usuario, fechaInicio, fechaFin } = req.query;
    
    // Construir filtros
    let filtros = {};
    
    if (accion) {
      filtros.accion = { $regex: accion, $options: 'i' };
    }
    
    if (usuario) {
      filtros.usuario = usuario;
    }
    
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    // Paginación
    const skip = (page - 1) * limit;
    
    const acciones = await Acciones.find(filtros)
      .populate('usuario', 'nombre email rol')
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Acciones.countDocuments(filtros);

    return res.status(200).json({
      data: acciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener acciones de auditoría' });
  }
};

//  Obtener estadísticas de auditoría - Solo admin/auditor
exports.obtenerEstadisticasAuditoria = async (req, res) => {
  try {
    // Acciones por tipo
    const accionesPorTipo = await Acciones.aggregate([
      {
        $group: {
          _id: '$accion',
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    // Acciones por usuario
    const accionesPorUsuario = await Acciones.aggregate([
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuario',
          foreignField: '_id',
          as: 'usuarioInfo'
        }
      },
      { $unwind: '$usuarioInfo' },
      {
        $group: {
          _id: '$usuario',
          nombre: { $first: '$usuarioInfo.nombre' },
          rol: { $first: '$usuarioInfo.rol' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    // Acciones por día (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const accionesPorDia = await Acciones.aggregate([
      {
        $match: {
          fecha: { $gte: hace30Dias }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const estadisticas = {
      accionesPorTipo,
      accionesPorUsuario,
      accionesPorDia,
      totalAcciones: await Acciones.countDocuments()
    };

    return res.status(200).json({ data: estadisticas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas de auditoría' });
  }
};

//  Buscar acciones específicas - Solo admin/auditor
exports.buscarAcciones = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
    }

    const acciones = await Acciones.find({
      $or: [
        { accion: { $regex: termino, $options: 'i' } },
        { detalles: { $regex: termino, $options: 'i' } }
      ]
    })
    .populate('usuario', 'nombre email rol')
    .sort({ fecha: -1 })
    .limit(100);

    return res.status(200).json({ data: acciones });
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar acciones' });
  }
};

//  Limpiar log de auditoría antiguo - Solo admin
exports.limpiarLogAntiguo = async (req, res) => {
  try {
    const { diasAntiguedad = 90 } = req.body;
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    const resultado = await Acciones.deleteMany({
      fecha: { $lt: fechaLimite }
    });

    // Registrar esta acción
    await Acciones.create({
      usuario: req.user.id,
      accion: 'LIMPIAR_LOG_AUDITORIA',
      detalles: `Usuario ${req.user.nombre} eliminó ${resultado.deletedCount} registros de auditoría anteriores a ${fechaLimite.toLocaleDateString()}`
    });

    return res.status(200).json({ 
      mensaje: `Se eliminaron ${resultado.deletedCount} registros antiguos`,
      registrosEliminados: resultado.deletedCount
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al limpiar log de auditoría' });
  }
};
