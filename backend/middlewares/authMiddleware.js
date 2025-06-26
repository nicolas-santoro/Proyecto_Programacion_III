const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
require('dotenv').config();

//Middleware para verificar TOKEN JWT (APIs JSON)
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token){
            return res.status(401).json({message: 'No se proporcionó TOKEN de autorización'})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Usuario.findById(decoded.id);

        if (!user){
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        // Verificar que sea admin
        if (user.rol !== 'admin') {
            return res.status(403).json({message: 'Solo los administradores pueden acceder a esta funcionalidad'})
        }

        req.user = user;
        next();
    } catch (error){
        return res.status(401).json({message: 'TOKEN inválido o expirado'})
    }
};

//Middleware para verificar TOKEN JWT desde cookies (vistas EJS)
const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token desde cookie
        const token = req.cookies.adminToken;

        if (!token){
            return res.redirect('/admin/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id);

        if (!usuario){
            return res.redirect('/admin/login');
        }

        // Verificar que sea admin
        if (usuario.rol !== 'admin') {
            return res.redirect('/admin/login');
        }

        req.usuario = usuario;
        next();
    } catch (error){
        return res.redirect('/admin/login');
    }
};

module.exports = authMiddleware;
module.exports.verifyToken = exports.verifyToken;