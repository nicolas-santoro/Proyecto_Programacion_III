module.exports = (req, res, next) => {
  const { nombreCliente, productos, total } = req.body;

  if (!nombreCliente || typeof nombreCliente !== 'string' || nombreCliente.trim() === '') {
    return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
  }
  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debe haber al menos un producto en la venta.' });
  }
  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'El total debe ser un número mayor a 0.' });
  }

  next();
};