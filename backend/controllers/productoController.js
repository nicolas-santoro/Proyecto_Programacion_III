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
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: nombre, precio, categoria' 
      });
    }

    // Manejar la imagen si se sube
    const datosProducto = { ...req.body, activo: true };
    if (req.file) {
      datosProducto.imagen = req.file.filename;
    }

    const nuevo = new Producto(datosProducto); 
    await nuevo.save();

    // Registrar la acción
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CREAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} creó producto ${nuevo.nombre}`
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Producto creado exitosamente', 
      producto: nuevo 
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al guardar producto' 
    });
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

// Obtener producto específico por ID - Solo admin/editor
exports.obtenerProductoPorId = async (req, res) => {
  try {
    console.log('=== OBTENIENDO PRODUCTO POR ID ===');
    console.log('ID recibido:', req.params.id);
    console.log('Usuario autenticado:', req.user ? req.user.email : 'No autenticado');
    
    const { id } = req.params;
    
    // Validar que el ID sea un ObjectId válido de MongoDB
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID inválido:', id);
      return res.status(400).json({ 
        success: false, 
        message: 'ID de producto inválido' 
      });
    }
    
    console.log('Buscando producto en la base de datos...');
    const producto = await Producto.findById(id);
    console.log('Producto encontrado:', producto ? 'SÍ' : 'NO');

    if (!producto) {
      console.log('Producto no encontrado para ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    console.log('Producto encontrado:', producto.nombre);

    // Registrar la acción
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CONSULTAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} consultó producto ${producto.nombre}`
    });

    console.log('Enviando respuesta exitosa');
    return res.status(200).json({ 
      success: true, 
      producto: producto 
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener producto: ' + error.message 
    });
  }
};

// Actualizar producto completamente - Solo admin/editor
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    // Manejar la imagen si se sube una nueva
    if (req.file) {
      actualizaciones.imagen = req.file.filename;
    }

    const producto = await Producto.findByIdAndUpdate(id, actualizaciones, { 
      new: true, 
      runValidators: true 
    });

    if (!producto) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }

    // Registrar acción de auditoría
    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ACTUALIZAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} actualizó producto: ${producto.nombre}`
    });

    return res.status(200).json({ 
      success: true,
      message: 'Producto actualizado exitosamente',
      producto: producto 
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar producto' 
    });
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