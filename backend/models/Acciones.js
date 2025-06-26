// Modelo para guardar cada acción importante (crear producto, editar, borrar, iniciar sesión, etc.)
const mongoose = require('mongoose');

const esquemaAccion = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  accion: {
    type: String,
    required: true,
    enum: [
      'CONSULTAR_USUARIOS', 'CREAR_USUARIO', 'ACTUALIZAR_USUARIO', 'ELIMINAR_USUARIO',
      'CONSULTAR_PRODUCTOS_ADMIN', 'CREAR_PRODUCTO', 'ACTUALIZAR_PRODUCTO', 'ELIMINAR_PRODUCTO',
      'CONSULTAR_VENTA', 'ACTUALIZAR_VENTA', 'ELIMINAR_VENTA',
      'CONSULTAR_ESTADISTICAS_PRODUCTOS', 'CONSULTAR_ESTADISTICAS_VENTAS', 'GENERAR_REPORTE_VENTAS',
      'LIMPIAR_LOG_AUDITORIA', 'CAMBIAR_PASSWORD', 'INICIAR_SESION', 'CERRAR_SESION'
    ]
  },
  detalles: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  direccionIP: {
    type: String,
    default: 'No disponible'
  }
});

module.exports = mongoose.model('Accion', esquemaAccion);