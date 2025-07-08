const Venta = require('../models/Venta');
/**
 * Crea una nueva venta con los datos recibidos del cliente.
 * Asigna fecha actual si no viene especificada en la petición.
 * @param {Object} req - Objeto de petición HTTP con datos de venta en el body
 * @param {string} req.body.nombreCliente - Nombre del cliente
 * @param {Array} req.body.productos - Array de productos con cantidades
 * @param {number} req.body.total - Total de la venta
 * @param {Date} [req.body.fecha] - Fecha de la venta (opcional)
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con mensaje de éxito o error
 */

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

/**
 * Obtiene todas las ventas registradas en el sistema.
 * Retorna las ventas ordenadas por fecha descendente (más recientes primero).
 * Solo accesible para usuarios con rol vendedor o administrador.
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con array de ventas o mensaje de error
 */
exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 }); 
    res.status(200).json({ data: ventas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};


// === MÉTODOS ADMINISTRATIVOS ===

/**
 * Obtiene una venta específica por su ID.
 * Registra la consulta en el sistema de auditoría para trazabilidad.
 * Solo accesible para usuarios con rol administrador o auditor.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID de la venta a consultar
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {string} req.user.id - ID del usuario que realiza la consulta
 * @param {string} req.user.nombre - Nombre del usuario para auditoría
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con datos de la venta o mensaje de error
 */
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
