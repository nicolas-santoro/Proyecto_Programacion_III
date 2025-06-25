const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/verificarRol');
const ventaController = require('../controllers/ventaController');

// Todos pueden crear ventas (usuarios pasajeros)
router.post('/crear', ventaController.crearVenta);

// Solo vendedor o admin pueden ver las ventas
router.get('/obtener', verifyToken, checkRole('vendedor'), ventaController.obtenerVentas);
router.get('/obtener/rango', verifyToken, checkRole('vendedor'), ventaController.obtenerVentasPorRango);

module.exports = router;