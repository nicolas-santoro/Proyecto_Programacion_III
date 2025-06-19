const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();

//Controlador para registro de Usuarios
exports.signup = async (req, res) => {
    try {
        const {nombre, email, password} = req.body;

        //Verificar si el usuario existe
        const existingUser = await Usuario.findOne({
            where: {
                email: email
            }
        });
        
        if (existingUser){
            return res.status(400).json({message: 'El email ya está registrado'})
        }

        //Crear nuevo Usuario
        const user = await Usuario.create({
            nombre,
            email,
            password
        });

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        })
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};

//Controlador para login
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        //Buscar usuario por mail
        const user = await Usuario.findOne({
            where: {
                email: email
            }
        });

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
            }
        })
    } catch (error){
        return res.status(500).json({message: error.message})
    }
};