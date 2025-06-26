const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Importar modelos
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');

// Importar middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite 5MB
});

// ===== RUTAS EJS (RENDERIZADO DE VISTAS) =====

// GET /admin/login - Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('admin/login', { 
    error: null 
  });
});

// POST /admin/login - Procesar login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      return res.render('admin/login', { 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.render('admin/login', { 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar que sea admin
    if (usuario.rol !== 'admin') {
      return res.render('admin/login', { 
        error: 'Solo los administradores pueden acceder al panel admin' 
      });
    }

    // Generar token
    const token = usuario.generarJWT();
    
    // Guardar token en cookie
    res.cookie('adminToken', token, { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    res.redirect('/admin/dashboard');
    
  } catch (error) {
    console.error('Error en login admin:', error);
    res.render('admin/login', { 
      error: 'Error en el servidor' 
    });
  }
});

// GET /admin/dashboard - Panel principal
router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('admin/dashboard', {
    usuario: req.usuario
  });
});

// GET /admin/productos - Lista de productos
router.get('/productos', authMiddleware, async (req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.render('admin/productos', { 
      productos,
      usuario: req.usuario,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    res.render('admin/productos', { 
      productos: [],
      error: 'Error al cargar los productos',
      usuario: req.usuario 
    });
  }
});

// GET /admin/productos/nuevo - Formulario crear producto
router.get('/productos/nuevo', authMiddleware, (req, res) => {
  res.render('admin/form-producto', {
    producto: null,
    usuario: req.usuario,
    success: req.query.success || null,
    error: req.query.error || null
  });
});

// GET /admin/productos/:id/editar - Formulario editar producto
router.get('/productos/:id/editar', authMiddleware, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.redirect('/admin/productos?error=Producto no encontrado');
    }

    res.render('admin/form-producto', {
      producto: producto,
      usuario: req.usuario,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    res.redirect('/admin/productos?error=Error al cargar producto');
  }
});

// POST /admin/productos - Crear producto
router.post('/productos', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const datosProducto = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: parseFloat(req.body.precio),
      categoria: req.body.categoria,
      stock: parseInt(req.body.stock),
      activo: true
    };

    // Si se subió imagen, agregar la ruta
    if (req.file) {
      datosProducto.imagen = req.file.filename;
    }

    // Crear producto
    const nuevoProducto = new Producto(datosProducto);
    await nuevoProducto.save();
    
    res.redirect('/admin/productos?success=Producto creado exitosamente');
    
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.redirect('/admin/productos/nuevo?error=Error al crear producto');
  }
});

// POST /admin/productos/:id - Actualizar producto (para formularios HTML que no soportan PUT)
router.post('/productos/:id', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const datosActualizacion = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: parseFloat(req.body.precio),
      categoria: req.body.categoria,
      stock: parseInt(req.body.stock)
    };

    // Si se subió nueva imagen, actualizarla
    if (req.file) {
      datosActualizacion.imagen = req.file.filename;
    }

    await Producto.findByIdAndUpdate(req.params.id, datosActualizacion);
    
    res.redirect('/admin/productos?success=Producto actualizado exitosamente');
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.redirect('/admin/productos?error=Error al actualizar producto');
  }
});

// POST /admin/productos/:id/eliminar - Eliminar producto
router.post('/productos/:id/eliminar', authMiddleware, async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.redirect('/admin/productos?success=Producto eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.redirect('/admin/productos?error=Error al eliminar producto');
  }
});

// GET /admin/logout - Cerrar sesión
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
});

module.exports = router;
