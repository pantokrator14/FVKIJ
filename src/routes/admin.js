//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
const router = require('express').Router();
const { isAuthenticated, checkPermissions } = require('../helpers/auth');
const Admin = require('..models/admin');
const Dojo = require('../models/dojo');
const Equipment = require('../models/equipment');

// Panel de administración
router.get('/FVK/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingDojos = await Dojo.find({ activo: false });
        const activeDojos = await Dojo.find({ activo: true, solvente: true });
        
        res.render('admin/init', {
            layout: 'admin',
            pendingDojos,
            activeDojos
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar el panel');
        res.redirect('/');
    }
});

// Rutas solo para secretario y presidente
router.get('/FVK/equipos',
  isAuthenticated,
  checkPermissions({ administrativo: true }),
  async (req, res) => {
    try {
        const equipment = await Equipment.find().populate('asignadoA');
        res.render('admin/asignaciones', {
            layout: 'admin',
            equipment
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar equipos');
        res.redirect('/admin/dashboard');
    }
  }
);

// Registro de Dojos (GET)
router.get('/FVK/DojoRegister', isAuthenticated, checkPermissions({ administrativo : true }), (req, res) => {
    res.render('register');
});

router.get('/FVK/AdminRegister', isAuthenticated, checkPermissions({ administrativo : true }), (req, res) => {
    res.render('admin/register');
});

// Registro de Dojos (POST)
router.post('/register', isAuthenticated, checkPermissions({ administrativo : true }), async (req, res) => {
    const errors = [];
    const { 
        DojoName, 
        DojoEmail, 
        DojoPassword, 
        PasswordConfirmation 
    } = req.body;

    // Validaciones básicas
    if (!DojoName) errors.push({ text: 'Nombre del dojo requerido' });
    if (!DojoEmail) errors.push({ text: 'Correo requerido' });
    if (DojoPassword !== PasswordConfirmation) errors.push({ text: 'Contraseñas no coinciden' });

    if (errors.length > 0) {
        return res.render('register', { errors, ...req.body });
    }

    try {
        const hashedPassword = bcrypt.hashSync(DojoPassword, 10);
        const newDojo = new Dojo({
            DojoName,
            DojoEmail,
            DojoPassword: hashedPassword,
            activo: false,
            solvente: false
        });

        await newDojo.save();
        req.flash('success_msg', 'Registro exitoso. Espere validación.');
        res.redirect('/');

    } catch (error) {
        if (error.code === 11000) {
            req.flash('error_msg', 'Correo ya registrado');
        } else {
            req.flash('error_msg', 'Error en el servidor');
        }
        res.redirect('/register');
    }
});


// Ruta solo para tesorero y presidente
router.get('/FVK/Ingresos',
  isAuthenticated,
  checkPermissions({ finanzas: true }),
  (req, res) => {
    // Lógica de finanzas
  }
);

module.exports = router;