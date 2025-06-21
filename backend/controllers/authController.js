const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
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
                nombre: user.bombre,
                email: user.email,
                rol: user.rol
            },
            token
        })
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};

//Controlador para obtener el perfil del usuario
exports.getProfile = async (req, res) => {
    try {
        const user = await Usuario.fyndById(req.user.id, {
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
        const user = await Usuario.find( {
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