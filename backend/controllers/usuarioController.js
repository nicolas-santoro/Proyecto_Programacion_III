const Usuario = require('../models/Usuario');
const Accion = require('../models/Acciones');

// 📋 Obtener todos los usuarios (solo administrador)
exports.obtenerUsuarios = async (peticion, respuesta) => {
  try {
    console.log('🔍 Obteniendo lista de usuarios...');
    const listaUsuarios = await Usuario.find().select('-password'); // Excluir contraseñas
    console.log('✅ Usuarios encontrados:', listaUsuarios.length);
    
    // Registrar acción de auditoría
    await Accion.create({
      usuario: peticion.user.id,
      accion: 'CONSULTAR_USUARIOS',
      detalles: `Usuario ${peticion.user.nombre} consultó la lista de usuarios`
    });

    return respuesta.status(200).json({ datos: listaUsuarios });
  } catch (error) {
    console.log('💥 Error al obtener usuarios:', error.message);
    return respuesta.status(500).json({ error: 'Error al obtener usuarios: ' + error.message });
  }
};

//  Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ data: usuario });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Crear nuevo usuario (solo admin)
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol
    });

    await nuevoUsuario.save();

    // Registrar acción de auditoría
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CREAR_USUARIO',
      detalles: `Usuario ${req.user.nombre} creó nuevo usuario: ${nombre} (${rol})`
    });

    return res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      data: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

//  Actualizar usuario (solo admin)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si se cambió el email, verificar que no exista otro usuario con ese email
    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ email, _id: { $ne: id } });
      if (emailExistente) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
      }
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;

    await usuario.save();

    // Registrar acción de auditoría
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ACTUALIZAR_USUARIO',
      detalles: `Usuario ${req.user.nombre} actualizó usuario: ${usuario.nombre}`
    });

    return res.status(200).json({ 
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

//  Eliminar usuario (solo admin)
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir auto-eliminación
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await Usuario.findByIdAndDelete(id);

    // Registrar acción de auditoría
    await Acciones.create({
      usuario: req.user.id,
      accion: 'ELIMINAR_USUARIO',
      detalles: `Usuario ${req.user.nombre} eliminó usuario: ${usuario.nombre} (${usuario.email})`
    });

    return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Cambiar contraseña de usuario
exports.cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuario.password = password; // El middleware pre('save') se encargará del hash
    await usuario.save();

    // Registrar acción de auditoría
    await Acciones.create({
      usuario: req.user.id,
      accion: 'CAMBIAR_PASSWORD',
      detalles: `Usuario ${req.user.nombre} cambió contraseña del usuario: ${usuario.nombre}`
    });

    return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};
