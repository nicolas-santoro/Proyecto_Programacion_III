const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
require('dotenv').config();

/**
 * Middleware para verificar el token JWT enviado en la cabecera Authorization
 * 
 * - Extrae el token del header `Authorization` en formato "Bearer <token>"
 * - Verifica que el token sea válido y no haya expirado usando la clave secreta
 * - Busca el usuario asociado al token en la base de datos
 * - Verifica que el usuario exista y tenga rol "admin"
 * - Si todo es correcto, adjunta el usuario a `req.user` para uso posterior
 * - En caso de error, responde con el código y mensaje HTTP correspondiente:
 *    - 401: Token no provisto o inválido/expirado
 *    - 404: Usuario no encontrado
 *    - 403: Usuario no autorizado (no es admin)
 */
exports.verifyToken = async (req, res, next) => {
    try {
        // Obtener token de Authorization header (formato "Bearer <token>")
        const token = req.headers.authorization?.split(' ')[1];

        if (!token){
            return res.status(401).json({message: 'No se proporcionó TOKEN de autorización'});
        }

        // Verificar y decodificar token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario en DB según ID del token
        const user = await Usuario.findById(decoded.id);

        if (!user){
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        // Verificar rol de admin
        if (user.rol !== 'admin') {
            return res.status(403).json({message: 'Solo los administradores pueden acceder a esta funcionalidad'});
        }

        // Adjuntar usuario al request para middleware o rutas siguientes
        req.user = user;
        next();
    } catch (error){
        // Token inválido o expirado
        return res.status(401).json({message: 'TOKEN inválido o expirado'});
    }
};

module.exports.verifyToken = exports.verifyToken;