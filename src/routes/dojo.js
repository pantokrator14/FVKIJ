//Aqui se van a colocar las configuraciones para inicio de sesion y registro de dojos, asi como su modificación y eliminación.
const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../helpers/auth');
const Dojo = require('../models/dojo');
const User = require('../models/user');

// Panel del dojo
router.get('/dojo/dashboard', isAuthenticated, async (req, res) => {
    try {
        const dojoData = await Dojo.findById(req.user._id);
        res.render('dojo/dashboard', { 
            layout: 'dojo',
            dojo: dojoData
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar el panel');
        res.redirect('/');
    }
});

// Lista de miembros
router.get('/dojo/members', isAuthenticated, async (req, res) => {
    try {
        const activeUsers = await User.find({ 
            dojoID: req.user._id, 
            solvente: true 
        }).sort({ creacion: -1 });
        
        const insolventes = await User.find({ 
            dojoID: req.user._id, 
            solvente: false 
        }).sort({ creacion: -1 });

        res.render('dojo/members', {
            layout: 'dojo',
            activeUsers,
            insolventes
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar miembros');
        res.redirect('/dojo/dashboard');
    }
});

// Actualizar información del dojo
router.put('/update/:id', isAuthenticated, async (req, res) => {
    try {
        await Dojo.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'Información actualizada correctamente');
        res.redirect('/dojo/dashboard');
    } catch (error) {
        req.flash('error_msg', 'Error al actualizar información');
        res.redirect('/dojo/config');
    }
});

// Eliminar dojo (Admin)
router.delete('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Dojo.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Dojo eliminado exitosamente');
        res.redirect('/FVK/dojos');
    } catch (error) {
        req.flash('error_msg', 'Error al eliminar dojo');
        res.redirect('/FVK/dojos');
    }
});

module.exports = router;