const Producto = require('../models/Producto');

/**
 * Obtiene todos los productos activos disponibles para venta.
 * Solo retorna productos con estado activo = true.
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con array de productos activos
 */
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Crea un nuevo producto en el sistema.
 * Requiere campos obligatorios: nombre, precio y categoría.
 * Opcionalmente maneja subida de imagen y registra la acción en auditoría.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.body.nombre - Nombre del producto (obligatorio)
 * @param {number} req.body.precio - Precio del producto (obligatorio)
 * @param {string} req.body.categoria - Categoría del producto (obligatorio)
 * @param {Object} [req.file] - Archivo de imagen subido (opcional)
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con producto creado o mensaje de error
 */
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

/**
 * Actualiza los datos de un producto existente por su ID.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a actualizar
 * @param {Object} req.body - Datos actualizados del producto
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con producto actualizado o mensaje de error
 */
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

/**
 * Realiza un "borrado suave" marcando el producto como inactivo.
 * No elimina físicamente el producto de la base de datos.
 * Registra la acción en auditoría. Solo accesible para administradores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a desactivar
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con producto desactivado o mensaje de error
 */
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

/**
 * Reactiva un producto previamente marcado como inactivo.
 * Cambia el estado de activo = false a activo = true.
 * Registra la acción en auditoría. Solo accesible para administradores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a reactivar
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con producto reactivado o mensaje de error
 */
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

/**
 * Obtiene todos los productos del sistema, incluyendo los inactivos.
 * Función administrativa que muestra el inventario completo.
 * Registra la consulta en auditoría. Solo para administradores/editores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con todos los productos o mensaje de error
 */
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

/**
 * Obtiene un producto específico por su ID para uso administrativo.
 * Valida que el ID sea un ObjectId válido de MongoDB.
 * Registra la consulta en auditoría. Solo para administradores/editores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a consultar
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con datos del producto o mensaje de error
 */
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

/**
 * Actualiza completamente un producto existente.
 * Maneja actualización de datos y subida de nueva imagen.
 * Registra la acción en auditoría. Solo para administradores/editores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a actualizar
 * @param {Object} req.body - Nuevos datos del producto
 * @param {Object} [req.file] - Nueva imagen del producto (opcional)
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con producto actualizado o mensaje de error
 */
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

/**
 * Elimina permanentemente un producto de la base de datos.
 * Esta acción es irreversible, a diferencia del borrado suave.
 * Valida ObjectId y registra en auditoría. Solo para administradores.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.params.id - ID del producto a eliminar permanentemente
 * @param {Object} req.user - Datos del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON confirmando eliminación o mensaje de error
 */
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