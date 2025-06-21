const jwt = require('jsonwebtoken');
const { Usuario } = require('../models/Usuario');
require('dotenv').config();

//Middleware para verificar TOKEN JWT
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token){
            return res.status(401).json({message: 'No se proporcionó TOKEN de autorización'})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Usuario.findByPk(decoded.id);

        if (!user){
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        req.user = user;
        next();
    } catch (error){
        return res.status(401).json({message: 'TOKEN inválido o expirado'})
    }
};