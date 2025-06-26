const Producto = require('../models/Producto');

// Obtener productos activos
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

//  Buscar productos por nombre (/search?nombre=xxx)
exports.buscarProducto = async (req, res) => {
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ error: 'Debes proporcionar un nombre para buscar' });
    }

    const productos = await Producto.find({ 
      nombre: { $regex: nombre, $options: 'i' }, 
      activo: true 
    });

    return res.status(200).json({ data: productos });
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar productos' });
  }
};

//  Buscar producto por ID
exports.buscarProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id);

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    return res.status(200).json({ data: producto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar producto por ID' });
  }
};

//  Crear producto nuevo
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, precio, categoria' });
    }

    const nuevo = new Producto({ ...req.body, activo: true }); 
    await nuevo.save();

    return res.status(201).json({ mensaje: 'Producto guardado con éxito', data: nuevo });
  } catch (error) {
    return res.status(500).json({ error: 'Error al guardar producto' });
  }
};

//  Actualizar producto
exports.modificarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });

    if (!productoActualizado) return res.status(404).json({ error: 'Producto no encontrado' });

    return res.status(200).json({ mensaje: 'Producto actualizado', data: productoActualizado });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

//  Borrar producto (marcar como inactivo)
exports.borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, { activo: false }, { new: true });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    return res.status(200).json({ mensaje: 'Producto marcado como inactivo', data: producto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al borrar producto' });
  }
};

//  Recuperar producto (marcar como activo)
exports.recuperarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, { activo: true }, { new: true });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    return res.status(200).json({ mensaje: 'Producto restaurado', data: producto });
  } catch (error) {
    return res.status(500).json({ error: 'Error al restaurar producto' });
  }
};

// === MÉTODOS ADMINISTRATIVOS ===

// Obtener todos los productos (incluyendo inactivos) - Solo admin/editor
exports.obtenerTodosProductos = async (req, res) => {
  try {
    const productos = await Producto.find(); // Incluye activos e inactivos
    
    // Registrar la acción
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CONSULTAR_PRODUCTOS_ADMIN',
      detalles: `Usuario ${req.user.nombre} consultó todos los productos`
    });

    return res.status(200).json({ data: productos });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Actualizar producto completamente - Solo admin/editor
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;

    const producto = await Producto.findByIdAndUpdate(id, actualizaciones, { 
      new: true, 
      runValidators: true 
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ACTUALIZAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} actualizó producto: ${producto.nombre}`
    });

    return res.status(200).json({ 
      mensaje: 'Producto actualizado exitosamente',
      data: producto 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

//  Eliminar producto permanentemente - Solo admin
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await Producto.findByIdAndDelete(id);

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ELIMINAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} eliminó permanentemente producto: ${producto.nombre}`
    });

    return res.status(200).json({ mensaje: 'Producto eliminado permanentemente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

//  Estadísticas de productos - Solo admin/auditor
exports.obtenerEstadisticasProductos = async (req, res) => {
  try {
    const totalProductos = await Producto.countDocuments();
    const productosActivos = await Producto.countDocuments({ activo: true });
    const productosInactivos = await Producto.countDocuments({ activo: false });
    
    // Productos más caros y más baratos
    const productoMasCaro = await Producto.findOne({ activo: true }).sort({ precio: -1 });
    const productoMasBarato = await Producto.findOne({ activo: true }).sort({ precio: 1 });

    const estadisticas = {
      totalProductos,
      productosActivos,
      productosInactivos,
      productoMasCaro,
      productoMasBarato
    };

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CONSULTAR_ESTADISTICAS_PRODUCTOS',
      detalles: `Usuario ${req.user.nombre} consultó estadísticas de productos`
    });

    return res.status(200).json({ data: estadisticas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};