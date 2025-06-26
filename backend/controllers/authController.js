const jwt = require('jsonwebtoken');
const path = require('path');
const Usuario = require(path.join(__dirname, '../models/Usuario'));
require('dotenv').config();

//Controlador para login
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        //Buscar usuario por mail
        const user = await Usuario.findOne({email: email});

        if (!user){
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        //Verificar contraseña
        const isValidPassword = await user.validPassword(password);

        if (!isValidPassword){
            return res.status(401).json({message: 'Contraseña incorrecta'})
        }

        //Generar TOKEN JWT
        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            },
            token
        })
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};

// Controlador para logout
exports.logout = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//Controlador para obtener el perfil del usuario
exports.getProfile = async (req, res) => {
    try {
        const user = await Usuario.findById(req.user.id, {
            attributes: {exclude: ['password']}
        });

        if (!user) {
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        return res.status(200).json(user);
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};

//Controlador para obtener a todos los usuarios
exports.getAllProfiles = async (req, res) => {
    try {
        const users = await Usuario.find({}, {
            attributes: {exclude: ['password']}
        });

        return res.status(200).json(users);
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};

// ===== MÉTODOS PARA PANEL ADMIN =====

//Obtener todos los usuarios para el panel admin
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, {
            attributes: {exclude: ['password']}
        });
        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Crear nuevo usuario/admin
exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({email});
        if (usuarioExistente) {
            return res.status(400).json({message: 'El usuario ya existe'});
        }

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password,
            rol: rol || 'vendedor' // rol por defecto
        });

        await nuevoUsuario.save();
        
        // Retornar sin password
        const usuarioCreado = await Usuario.findById(nuevoUsuario._id, {
            attributes: {exclude: ['password']}
        });
        
        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: usuarioCreado
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Editar usuario existente
exports.editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;
        
        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { nombre, email, rol },
            { new: true, select: '-password' }
        );
        
        if (!usuario) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        
        return res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            usuario
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

//Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // No permitir eliminar al usuario actual
        if (id === req.user.id) {
            return res.status(400).json({message: 'No puedes eliminar tu propia cuenta'});
        }
        
        const usuario = await Usuario.findByIdAndDelete(id);
        
        if (!usuario) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        
        return res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};