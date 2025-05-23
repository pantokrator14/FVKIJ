//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../helpers/auth');
const Dojo = require('../models/dojo');
const Equipment = require('../models/equipment');

// Panel de administración
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const pendingDojos = await Dojo.find({ activo: false });
        const activeDojos = await Dojo.find({ activo: true, solvente: true });
        
        res.render('admin/dashboard', {
            layout: 'admin',
            pendingDojos,
            activeDojos
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar el panel');
        res.redirect('/');
    }
});

// Aprobar dojo
router.put('/approve/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Dojo.findByIdAndUpdate(req.params.id, { 
            activo: true,
            solvente: true 
        });
        req.flash('success_msg', 'Dojo aprobado exitosamente');
        res.redirect('/admin/dashboard');
    } catch (error) {
        req.flash('error_msg', 'Error al aprobar dojo');
        res.redirect('/admin/dashboard');
    }
});

// Gestión de equipos
router.get('/equipment', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const equipment = await Equipment.find().populate('asignadoA');
        res.render('admin/equipment', {
            layout: 'admin',
            equipment
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar equipos');
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;