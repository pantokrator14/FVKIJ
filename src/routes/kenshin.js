//Aqui se van a colocar las configuraciones para inicio de sesion y registro de usuarios.
const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const User = require('../models/user');

// Perfil de estudiante
router.get('/profile/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
                                  .populate('dojoID');
        
        res.render('kenshin/profile', {
            layout: 'kenshin',
            student
        });
    } catch (error) {
        req.flash('error_msg', 'Estudiante no encontrado');
        res.redirect('/dojo/members');
    }
});

// Actualizar perfil
router.put('/update/:id', isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'Perfil actualizado');
        res.redirect(`/kenshin/profile/${req.params.id}`);
    } catch (error) {
        req.flash('error_msg', 'Error al actualizar');
        res.redirect(`/kenshin/profile/${req.params.id}`);
    }
});

// Registrar pago
router.post('/payment/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        student.pagos.push(req.body);
        await student.save();
        
        req.flash('success_msg', 'Pago registrado');
        res.redirect(`/kenshin/profile/${req.params.id}`);
    } catch (error) {
        req.flash('error_msg', 'Error al registrar pago');
        res.redirect(`/kenshin/profile/${req.params.id}`);
    }
});

module.exports = router;