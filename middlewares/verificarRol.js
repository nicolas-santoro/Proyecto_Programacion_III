//Checkea los roles
module.exports = function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.user?.rol; // suponemos que verifyToken ya cargó el user

    if (!rol) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Si es admin, pasa siempre
    if (rol === 'admin') {
      return next();
    }

    // Sino, verificar si está en la lista de roles permitidos
    if (rolesPermitidos.includes(rol)) {
      return next();
    }

    return res.status(403).json({ error: 'Acceso denegado: rol sin permisos para esta acción' });
  };
};