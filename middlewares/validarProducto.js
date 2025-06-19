module.exports = (req, res, next) => {
  const { nombre, precio, categoria } = req.body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe ser texto.' });
  }
  if (typeof precio !== 'number' || precio <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor a 0.' });
  }
  if (!categoria || typeof categoria !== 'string') {
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
  }
  next();
};