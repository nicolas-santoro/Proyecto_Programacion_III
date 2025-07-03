const Acciones = require('../models/Acciones');

// Obtener todas las acciones (Solo admin/auditor)
// Permite filtrar por tipo de acción, usuario, rango de fechas, y paginar resultados
exports.obtenerAcciones = async (req, res) => {
  try {
    const { page = 1, limit = 50} = req.query;

    // Calcular salto para paginación (skip)
    const skip = (page - 1) * limit;
    
    // Buscar acciones según filtros, ordenar por fecha descendente, paginar y popular datos del usuario
    const acciones = await Acciones.find()
      .populate('usuario', 'nombre email rol')
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar el total de documentos para la paginación
    const total = await Acciones.countDocuments();

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