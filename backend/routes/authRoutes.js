const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/verificarRol');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.post('/logout', verifyToken, authController.logout);
router.get('/profiles', verifyToken, checkRole('auditor'), authController.getAllProfiles);
router.get('/profile', verifyToken, checkRole('auditor'), authController.getProfile);

module.exports = router;