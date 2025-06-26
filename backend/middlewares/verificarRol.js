// Middleware para verificar roles específicos
// Roles: admin, editor, vendedor, auditor
exports.checkRole = function(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.user?.rol; // verifyToken ya cargó el user

    if (!rol) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Si es admin, pasa siempre (acceso total)
    if (rol === 'admin') {
      return next();
    }

    // Verificar si está en la lista de roles permitidos
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

// Middleware específico para diferentes niveles de acceso
exports.soloAdmin = exports.checkRole('admin');
exports.adminOEditor = exports.checkRole('admin', 'editor');
exports.adminOVendedor = exports.checkRole('admin', 'vendedor');
exports.todosRoles = exports.checkRole('admin', 'editor', 'vendedor', 'auditor');