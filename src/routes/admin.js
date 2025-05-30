//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const Dojo = require('../models/dojo');
const Equipment = require('../models/equipment');
const bcrypt = require('bcryptjs');

// Middleware para verificar rol de administrador
const isAdminRole = (req, res, next) => {
  const adminRoles = ['secretario', 'tesorero', 'presidente'];
  if (req.user && adminRoles.includes(req.user.role)) {
    return next();
  }
  req.flash('error_msg', 'Acceso no autorizado');
  res.redirect('/');
};

// Middleware para verificar roles específicos
const checkAdminType = (allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    req.flash('error_msg', 'Acceso no autorizado');
    res.redirect('/FVK/dashboard');
  };
};

// Panel de administración
router.get('/FVK/dashboard', isAuthenticated, isAdminRole, async (req, res) => {
  try {
    const pendingDojos = await Dojo.find({ activo: false });
    const activeDojos = await Dojo.find({ activo: true, solvente: true });
    
    res.render('dashboard', {
      layout: 'admin',
      pendingDojos,
      activeDojos,
      userRole: req.user.role // Pasar el rol a la vista
    });
  } catch (error) {
    req.flash('error_msg', 'Error al cargar el panel');
    res.redirect('/');
  }
});

// Gestión de equipos (solo secretario y presidente)
router.get('/FVK/equipos',
  isAuthenticated,
  checkAdminType(['secretario', 'presidente']),
  async (req, res) => {
    try {
      const equipment = await Equipment.find().populate('asignadoA');
      res.render('admin/asignaciones', {
        layout: 'admin',
        equipment
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar equipos');
      res.redirect('/FVK/dashboard');
    }
  }
);

// Registro de Dojos (GET)
router.get('/FVK/DojoRegister', 
  isAuthenticated,
  checkAdminType(['secretario', 'presidente']),
  (req, res) => {
    res.render('admin/register', { 
      layout: 'admin',
      userRole: req.user.role
    });
  }
);

// Registro de Nuevos Administradores (GET)
router.get('/FVK/AdminRegister', 
  isAuthenticated,
  checkAdminType(['presidente']), // Solo presidente puede crear admins
  (req, res) => {
    res.render('admin/register', { 
      layout: 'admin',
      userRole: req.user.role
    });
  }
);

router.get('/FVK/dojos', 
  isAuthenticated,
  checkAdminType(['secretario', 'presidente']),
  async (req, res) => {
    try {
      const dojos = await Dojo.find().populate('adminUser');
      
      // Calcular solvencia para cada dojo
      const dojosWithSolvency = [];
      for (const dojo of dojos) {
        const isSolvent = await dojo.isSolvent(); // Usar el método del modelo
        dojosWithSolvency.push({
          ...dojo.toObject(),
          isSolvent
        });
      }

      res.render('admin/dojolist', {
        layout: 'admin',
        dojos: dojosWithSolvency,
        formatDate: (date) => moment(date).format('DD/MM/YYYY')
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar la lista de dojos');
      res.redirect('/admin/dashboard');
    }
  }
);

// Registro de Dojos (POST)
router.post('/FVK/DojoRegister', 
  isAuthenticated,
  checkAdminType(['secretario', 'presidente']),
  async (req, res) => {
    const errors = [];
    const { 
      name, 
      email, 
      password, 
      confirm_password 
    } = req.body;

    // Validaciones básicas
    if (!name) errors.push({ text: 'Nombre del dojo requerido' });
    if (!email) errors.push({ text: 'Correo requerido' });
    if (password !== confirm_password) errors.push({ text: 'Contraseñas no coinciden' });
    if (password.length < 6) errors.push({ text: 'La contraseña debe tener al menos 6 caracteres' });

    if (errors.length > 0) {
      return res.render('admin/dojo-register', { 
        layout: 'admin',
        errors,
        name,
        email,
        userRole: req.user.role
      });
    }

    try {
      // Verificar si el email ya existe
      const existingDojo = await Dojo.findOne({ email });
      if (existingDojo) {
        errors.push({ text: 'El correo ya está registrado' });
        return res.render('admin/dojo-register', { 
          layout: 'admin',
          errors,
          name,
          email,
          userRole: req.user.role
        });
      }

      // Crear nuevo dojo
      const newDojo = new Dojo({
        name,
        email,
        password,
        role: 'dojo',
        activo: false,
        solvente: false
      });

      // Guardar en la base de datos
      await newDojo.save();
      req.flash('success_msg', 'Dojo registrado exitosamente. Espere validación.');
      res.redirect('/FVK/dashboard');

    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error en el servidor');
      res.redirect('/FVK/dojos');
    }
  }
);

// Gestión de finanzas (solo tesorero y presidente)
router.get('/FVK/Finanzas',
  isAuthenticated,
  checkAdminType(['tesorero', 'presidente']),
  (req, res) => {
    // Redirigir a la vista universal de pagos
    res.redirect('/pago/ingresos');
  }
);

//borrar dojos
router.delete('/FVK/dojos/:id', 
  isAuthenticated,
  checkAdminType(['secretario', 'presidente']),
  async (req, res) => {
    try {
      await Dojo.findByIdAndDelete(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;