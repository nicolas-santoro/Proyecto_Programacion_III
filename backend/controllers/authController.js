const jwt = require('jsonwebtoken');
const path = require('path');
const Usuario = require(path.join(__dirname, '../models/Usuario'));
require('dotenv').config();

// Controlador para login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const user = await Usuario.findOne({ email: email });

        if (!user) {
            // Usuario no encontrado
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña con método del modelo (ej: bcrypt)
        const isValidPassword = await user.validPassword(password);

        if (!isValidPassword) {
            // Contraseña incorrecta
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar token JWT con payload {id} y expiración configurada
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Responder con datos del usuario y token
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            },
            token
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Controlador para logout (simple, sin gestión de tokens invalidos)
exports.logout = async (req, res) => {
    try {
        // Solo responde OK, en JWT no se suele invalidar explícitamente token aquí
        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Controlador para obtener el perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
        // Buscar usuario por id del token (req.user.id) excluyendo la contraseña
        const user = await Usuario.findById(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Controlador para obtener todos los usuarios (sin password)
exports.getAllProfiles = async (req, res) => {
    try {
        // Buscar todos los usuarios excluyendo la contraseña
        const users = await Usuario.find({}, {
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ===== MÉTODOS PARA PANEL ADMIN =====

// Obtener todos los usuarios para panel admin (sin password)
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, {
            attributes: { exclude: ['password'] }
        });
        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Crear nuevo usuario o admin
exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        // Verificar si el usuario ya existe por email
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear instancia nueva, asignando rol por defecto 'vendedor' si no se pasa
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password,
            rol: rol || 'vendedor'
        });

        // Guardar en la base
        await nuevoUsuario.save();
        
        // Recuperar usuario creado excluyendo password para enviar respuesta
        const usuarioCreado = await Usuario.findById(nuevoUsuario._id, {
            attributes: { exclude: ['password'] }
        });
        
        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: usuarioCreado
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Editar usuario existente (nombre, email, rol)
exports.editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;
        
        // Actualizar usuario, devolver nuevo documento y excluir password
        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { nombre, email, rol },
            { new: true, select: '-password' }
        );
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        return res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            usuario
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar usuario por id
exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // No permitir que un usuario se elimine a sí mismo
        if (id === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }
        
        // Intentar eliminar usuario
        const usuario = await Usuario.findByIdAndDelete(id);
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        return res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};