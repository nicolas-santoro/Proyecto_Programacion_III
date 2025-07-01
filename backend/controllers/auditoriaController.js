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