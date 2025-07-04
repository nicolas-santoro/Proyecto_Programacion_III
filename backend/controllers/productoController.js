const Producto = require('../models/Producto');

// Obtener todos los productos activos (disponibles para venta)
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Buscar productos activos por nombre (consulta tipo /search?nombre=xxx)
exports.buscarProducto = async (req, res) => {
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ error: 'Debes proporcionar un nombre para buscar' });
    }

    // Busca con expresión regular insensible a mayúsculas
    const productos = await Producto.find({ 
      nombre: { $regex: nombre, $options: 'i' }, 
      activo: true 
    });

    return res.status(200).json({ data: productos });
  } catch (error) {
    return res.status(500).json({ error: 'Error al buscar productos' });
  }
};

// Buscar producto por su ID
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

// Crear un nuevo producto (requiere nombre, precio y categoría)
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: nombre, precio, categoria' 
      });
    }

    // Si se sube una imagen, guardarla con la ruta correspondiente
    const datosProducto = { ...req.body, activo: true };
    if (req.file) {
      datosProducto.imagen = `/uploads/${req.file.filename}`;
    }

    const nuevo = new Producto(datosProducto); 
    await nuevo.save();

    // Registrar la acción en auditoría
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

// Actualizar datos de un producto por su ID
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

// "Borrado suave" de producto: marcar como inactivo sin eliminar (solo admin)
// Incluye logs de auditoría con manejo de errores para no interrumpir el flujo
exports.borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, { activo: false }, { new: true });

    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    try {
      const Acciones = require('../models/Acciones');
      await Acciones.create({
        usuario: req.user.id,
        accion: 'DESACTIVAR_PRODUCTO',
        detalles: `Usuario ${req.user.nombre} desactivó producto: ${producto.nombre}`
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
      // Continuar sin bloquear la respuesta principal
    }

    return res.status(200).json({ success: true, message: 'Producto desactivado exitosamente', data: producto });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return res.status(500).json({ success: false, message: 'Error al desactivar producto' });
  }
};

// Recuperar producto marcado como inactivo (solo admin)
exports.recuperarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, { activo: true }, { new: true });

    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    try {
      const Acciones = require('../models/Acciones');
      await Acciones.create({
        usuario: req.user.id,
        accion: 'REACTIVAR_PRODUCTO',
        detalles: `Usuario ${req.user.nombre} reactivó producto: ${producto.nombre}`
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
    }

    return res.status(200).json({ success: true, message: 'Producto reactivado exitosamente', data: producto });
  } catch (error) {
    console.error('Error al reactivar producto:', error);
    return res.status(500).json({ success: false, message: 'Error al reactivar producto' });
  }
};

// Obtener todos los productos, incluyendo inactivos (solo admin/editor)
// Registra la acción en auditoría
exports.obtenerTodosProductos = async (req, res) => {
  try {
    const productos = await Producto.find();

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

// Obtener producto por ID para admin/editor, validando ID y auditando consulta
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que sea un ObjectId válido de MongoDB
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de producto inválido' });
    }

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Registrar auditoría (sin interrumpir la respuesta si falla)
    try {
      const Acciones = require('../models/Acciones');
      await Acciones.create({
        usuario: req.user.id,
        accion: 'CONSULTAR_PRODUCTO',
        detalles: `Usuario ${req.user.nombre} consultó producto ${producto.nombre}`
      });
    } catch (auditoriaError) {
      console.error('Error al guardar acción de auditoría:', auditoriaError);
    }

    return res.status(200).json({ success: true, producto });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener producto: ' + error.message });
  }
};

// Actualizar producto completamente (admin/editor), incluye manejo de imagen
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    if (req.file) {
      actualizaciones.imagen = `/uploads/${req.file.filename}`;
    }

    const producto = await Producto.findByIdAndUpdate(id, actualizaciones, { new: true, runValidators: true });

    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const Acciones = require('../models/Acciones');
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ACTUALIZAR_PRODUCTO',
      detalles: `Usuario ${req.user.nombre} actualizó producto: ${producto.nombre}`
    });

    return res.status(200).json({ success: true, message: 'Producto actualizado exitosamente', producto });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

// Eliminar producto permanentemente de la base de datos (solo admin)
exports.eliminarProductoPermanentemente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que sea un ObjectId válido de MongoDB
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de producto inválido' });
    }

    // Buscar y eliminar el producto
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Registrar la acción en auditoría usando una acción válida del enum
    try {
      const Acciones = require('../models/Acciones');
      await Acciones.create({
        usuario: req.user.id,
        accion: 'ELIMINAR_PRODUCTO',
        detalles: `Usuario ${req.user.nombre} eliminó permanentemente el producto: ${producto.nombre}`
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError);
      // Continuar sin bloquear la respuesta principal
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Producto eliminado permanentemente', 
      data: producto 
    });
  } catch (error) {
    console.error('Error al eliminar producto permanentemente:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar producto permanentemente' 
    });
  }
};