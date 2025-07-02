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
        const user = await Usuario.findById(req.user.id).select('-password');
        // alternativamente: const user = await Usuario.findById(req.user.id, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
