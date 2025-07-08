const Acciones = require('../models/Acciones');
/**
 * Obtiene todas las acciones de auditoría del sistema con paginación.
 * Permite filtrar y paginar resultados para facilitar la consulta de logs.
 * Solo accesible para usuarios con rol administrador o auditor.
 * @param {Object} req - Objeto de petición HTTP
 * @param {number} [req.query.page=1] - Número de página para paginación
 * @param {number} [req.query.limit=50] - Límite de resultados por página
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con acciones paginadas y metadatos de paginación
 */
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