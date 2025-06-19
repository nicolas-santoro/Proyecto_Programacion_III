const router = require('express').Router();
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/verificarRol');
const productoController = require('../controllers/productoController');

// Todos los usuarios pueden ver los productos
// Al vendedor solamente le tienen que apararecer los productos activos, al admin y al editor todos
router.get('/', verifyToken, checkRole('editor', 'vendedor'), productoController.obtenerProductos);
router.get('/search', verifyToken, checkRole('editor', 'vendedor'), productoController.buscarProducto);

// Solo los editores y los administradores pueden crear, editar, borrar o restaurar productos
router.post('/', verifyToken, checkRole('editor'), productoController.crearProducto);
router.put('/:id', verifyToken, checkRole('editor'), productoController.modificarProducto);
router.delete('/:id', verifyToken, checkRole('editor'), productoController.borrarProducto);
router.put('/:id/restore', verifyToken, checkRole('editor'), productoController.recuperarProducto);

module.exports = router;