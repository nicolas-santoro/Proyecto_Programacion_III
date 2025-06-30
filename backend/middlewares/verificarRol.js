/**
 * Middleware para verificar roles específicos en APIs JSON.
 * 
 * @param  {...string} rolesPermitidos - Roles que pueden acceder (ej: 'admin', 'editor', 'vendedor', 'auditor').
 * 
 * Comportamiento:
 * - Asume que `req.user` ya está cargado por un middleware de autenticación previo (ej: verifyToken).
 * - Si el rol del usuario es 'admin', se le concede acceso siempre (acceso total).
 * - Si el rol del usuario está en rolesPermitidos, se concede acceso.
 * - Si no, se responde con 403 Forbidden.
 */
exports.checkRole = function(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.user?.rol; // El middleware de auth debe haber cargado el usuario

    if (!rol) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (rol === 'admin') {
      return next();
    }

    if (rolesPermitidos.includes(rol)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado: rol sin permisos para esta acción',
      rolRequerido: rolesPermitidos,
      rolActual: rol
    });
  };
};

// Middlewares específicos para API JSON según nivel de acceso
exports.soloAdmin = exports.checkRole('admin');
exports.adminOEditor = exports.checkRole('admin', 'editor');
exports.adminOVendedor = exports.checkRole('admin', 'vendedor');
exports.todosRoles = exports.checkRole('admin', 'editor', 'vendedor', 'auditor');