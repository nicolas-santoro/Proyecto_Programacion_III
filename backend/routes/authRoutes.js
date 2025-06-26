const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas (solo admin)
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);
router.get('/profiles', verifyToken, authController.getAllProfiles);

module.exports = router;