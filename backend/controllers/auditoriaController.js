const Acciones = require('../models/Acciones');

// Obtener todas las acciones (Solo admin/auditor)
// Permite filtrar por tipo de acción, usuario, rango de fechas, y paginar resultados
exports.obtenerAcciones = async (req, res) => {
  try {
    // Extraemos parámetros de query para filtros y paginación
    const { page = 1, limit = 50, accion, usuario, fechaInicio, fechaFin } = req.query;
    
    // Construir el objeto filtros dinámicamente según los parámetros recibidos
    let filtros = {};
    
    // Filtro por nombre de acción con búsqueda parcial e insensible a mayúsculas/minúsculas
    if (accion) {
      filtros.accion = { $regex: accion, $options: 'i' };
    }
    
    // Filtro por usuario exacto (ID)
    if (usuario) {
      filtros.usuario = usuario;
    }
    
    // Filtro por rango de fechas (entre fechaInicio y fechaFin)
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    // Calcular salto para paginación (skip)
    const skip = (page - 1) * limit;
    
    // Buscar acciones según filtros, ordenar por fecha descendente, paginar y popular datos del usuario
    const acciones = await Acciones.find(filtros)
      .populate('usuario', 'nombre email rol')
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar el total de documentos para la paginación
    const total = await Acciones.countDocuments(filtros);

    // Retornar resultados con datos y meta información de paginación
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
    // En caso de error devolver mensaje genérico
    return res.status(500).json({ error: 'Error al obtener acciones de auditoría' });
  }
};

// Obtener estadísticas de auditoría (Solo admin/auditor)
// Realiza agregaciones para contar acciones por tipo, usuario y por día (últimos 30 días)
exports.obtenerEstadisticasAuditoria = async (req, res) => {
  try {
    // Contar acciones agrupadas por tipo de acción
    const accionesPorTipo = await Acciones.aggregate([
      {
        $group: {
          _id: '$accion',
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } } // Orden descendente por cantidad
    ]);

    // Contar acciones agrupadas por usuario, incluyendo nombre y rol desde colección usuarios
    const accionesPorUsuario = await Acciones.aggregate([
      {
        $lookup: {
          from: 'usuarios',       // Colección a unir
          localField: 'usuario',  // Campo local
          foreignField: '_id',    // Campo en usuarios
          as: 'usuarioInfo'       // Nombre del array resultante
        }
      },
      { $unwind: '$usuarioInfo' }, // Desenrollar array para agrupar por usuario único
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

    // Contar acciones por día en los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const accionesPorDia = await Acciones.aggregate([
      {
        $match: {
          fecha: { $gte: hace30Dias } // Filtrar por fecha reciente
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } }, // Agrupar por día en formato string
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } } // Orden cronológico ascendente
    ]);

    // Construir objeto resumen con todas las estadísticas y total de acciones
    const estadisticas = {
      accionesPorTipo,
      accionesPorUsuario,
      accionesPorDia,
      totalAcciones: await Acciones.countDocuments()
    };

    // Responder con datos estadísticos
    return res.status(200).json({ data: estadisticas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas de auditoría' });
  }
};

// Buscar acciones específicas por término (Solo admin/auditor)
// Busca texto parcialmente en campos 'accion' o 'detalles'
exports.buscarAcciones = async (req, res) => {
  try {
    const { termino } = req.query;
    
    // Validar que el término de búsqueda esté presente
    if (!termino) {
      return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
    }

    // Buscar en campos 'accion' o 'detalles' con regex insensible
    const acciones = await Acciones.find({
      $or: [
        { accion: { $regex: termino, $options: 'i' } },
        { detalles: { $regex: termino, $options: 'i' } }
      ]
    })
    .populate('usuario', 'nombre email rol')
    .sort({ fecha: -1 })
    .limit(100); // Limitar resultados a 100

    // Devolver resultados encontrados
    return res.status(200).json({ data: acciones });
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar acciones' });
  }
};

// Limpiar log de auditoría antiguo (Solo admin)
// Elimina registros anteriores a una cierta antigüedad en días, por defecto 90
exports.limpiarLogAntiguo = async (req, res) => {
  try {
    const { diasAntiguedad = 90 } = req.body; // Días de antigüedad para eliminar

    // Fecha límite calculada restando días actuales
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    // Eliminar registros anteriores a la fecha límite
    const resultado = await Acciones.deleteMany({
      fecha: { $lt: fechaLimite }
    });

    // Registrar en la auditoría esta acción de limpieza, usando datos del usuario autenticado
    await Acciones.create({
      usuario: req.user.id,
      accion: 'LIMPIAR_LOG_AUDITORIA',
      detalles: `Usuario ${req.user.nombre} eliminó ${resultado.deletedCount} registros de auditoría anteriores a ${fechaLimite.toLocaleDateString()}`
    });

    // Responder con resumen de eliminación
    return res.status(200).json({ 
      mensaje: `Se eliminaron ${resultado.deletedCount} registros antiguos`,
      registrosEliminados: resultado.deletedCount
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al limpiar log de auditoría' });
  }
};