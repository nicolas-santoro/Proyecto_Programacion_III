const express = require('express');
const router = express.Router(); // Importamos express y creamos un router

// Ruta de prueba
router.get('/', (req, res) => {
  res.send('API funcionando');
});

module.exports = router;