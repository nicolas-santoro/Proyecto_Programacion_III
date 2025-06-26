const express = require('express');
const router = express.Router();

const productoRoutes = require('./productosRoutes');
const ventaRoutes = require('./ventasRoutes');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkRole, soloAdmin, adminOEditor, adminOVendedor, todosRoles } = require('../middlewares/verificarRol');
const usuarioController = require('../controllers/usuarioController');
const productoController = require('../controllers/productoController');
const ventaController = require('../controllers/ventaController');
const auditoriaController = require('../controllers/auditoriaController');

//const validarProducto = require('../middlewares/validarProducto');
//const validarVenta = require('../middlewares/validarVenta');

router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);

// === RUTAS DE ADMINISTRACIÓN POR ROLES ===

//  GESTIÓN DE USUARIOS (Solo Admin)
router.get('/admin/usuarios', verifyToken, soloAdmin, usuarioController.obtenerUsuarios);
router.get('/admin/usuarios/:id', verifyToken, soloAdmin, usuarioController.obtenerUsuarioPorId);
router.post('/admin/usuarios', verifyToken, soloAdmin, usuarioController.crearUsuario);
router.put('/admin/usuarios/:id', verifyToken, soloAdmin, usuarioController.actualizarUsuario);
router.delete('/admin/usuarios/:id', verifyToken, soloAdmin, usuarioController.eliminarUsuario);
router.put('/admin/usuarios/:id/password', verifyToken, soloAdmin, usuarioController.cambiarPassword);

//  GESTIÓN DE PRODUCTOS 
// Admin: Acceso total | Editor: Modificar | Vendedor: Solo crear | Auditor: Solo ver
router.get('/admin/productos', verifyToken, todosRoles, productoController.obtenerTodosProductos);
router.get('/admin/productos/estadisticas', verifyToken, checkRole('admin', 'auditor'), productoController.obtenerEstadisticasProductos);
router.post('/admin/productos', verifyToken, adminOVendedor, productoController.crearProducto);
router.put('/admin/productos/:id', verifyToken, adminOEditor, productoController.actualizarProducto);
router.delete('/admin/productos/:id', verifyToken, soloAdmin, productoController.eliminarProducto);

//  GESTIÓN DE VENTAS
// Admin: Acceso total | Editor: Solo ver | Vendedor: Ver propias | Auditor: Solo ver
router.get('/admin/ventas', verifyToken, todosRoles, ventaController.obtenerVentas);
router.get('/admin/ventas/:id', verifyToken, todosRoles, ventaController.obtenerVentaPorId);
router.put('/admin/ventas/:id', verifyToken, soloAdmin, ventaController.actualizarVenta);
router.delete('/admin/ventas/:id', verifyToken, soloAdmin, ventaController.eliminarVenta);

//  ESTADÍSTICAS Y REPORTES (Admin y Auditor)
router.get('/admin/estadisticas', verifyToken, checkRole('admin', 'auditor'), ventaController.obtenerEstadisticas);
router.get('/admin/reportes/ventas', verifyToken, checkRole('admin', 'auditor'), ventaController.obtenerReporteVentas);

//  AUDITORÍA (Admin y Auditor)
router.get('/admin/auditoria', verifyToken, checkRole('admin', 'auditor'), auditoriaController.obtenerAcciones);
router.get('/admin/auditoria/estadisticas', verifyToken, checkRole('admin', 'auditor'), auditoriaController.obtenerEstadisticasAuditoria);
router.get('/admin/auditoria/buscar', verifyToken, checkRole('admin', 'auditor'), auditoriaController.buscarAcciones);
router.delete('/admin/auditoria/limpiar', verifyToken, soloAdmin, auditoriaController.limpiarLogAntiguo);

module.exports = router;