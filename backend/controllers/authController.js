const jwt = require('jsonwebtoken');
const path = require('path');
const Usuario = require(path.join(__dirname, '../models/Usuario'));
require('dotenv').config();

/**
 * Maneja el proceso de autenticación de usuarios.
 * Valida credenciales, genera token JWT y retorna datos del usuario.
 * @param {Object} req - Objeto de petición HTTP
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con token y datos de usuario o mensaje de error
 */
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

/**
 * Maneja el cierre de sesión del usuario.
 * En implementación JWT simple, solo responde con mensaje de éxito.
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con mensaje de logout exitoso
 */
exports.logout = async (req, res) => {
    try {
        // Solo responde OK, en JWT no se suele invalidar explícitamente token aquí
        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene el perfil del usuario autenticado.
 * Excluye la contraseña de la respuesta por seguridad.
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} req.user - Datos del usuario autenticado (agregado por middleware)
 * @param {string} req.user.id - ID del usuario autenticado
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>} Respuesta JSON con datos del perfil de usuario
 */
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
