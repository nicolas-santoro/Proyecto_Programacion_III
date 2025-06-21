const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;