const router = require('express').Router();
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/verificarRol');
const ventaController = require('../controllers/ventaController');

// Todos pueden crear ventas (usuarios pasajeros)
router.post('/', ventaController.crearVenta);

// Solo vendedor o admin pueden ver las ventas
router.get('/', verifyToken, checkRole('vendedor'), ventaController.obtenerVentas);
router.get('/rango', verifyToken, checkRole('vendedor'), ventaController.obtenerVentasPorRango);

module.exports = router;