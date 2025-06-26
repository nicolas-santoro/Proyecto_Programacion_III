const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const ventaController = require('../controllers/ventaController');

// Todos pueden crear ventas (usuarios pasajeros)
router.post('/crear', ventaController.crearVenta);

// Solo admin puede ver las ventas
router.get('/obtener', verifyToken, ventaController.obtenerVentas);

module.exports = router;