const Venta = require('../models/Venta');

// Crear venta (usuarios tipo "pasajero" pueden usarlo)
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

// Obtener todas las ventas (solo vendedores o admins)
// Retorna todas las ventas ordenadas por fecha descendente
exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fecha: -1 }); 
    res.status(200).json({ data: ventas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};


// === MÉTODOS ADMINISTRATIVOS ===

// Obtener venta por ID (solo admin/auditor)
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
