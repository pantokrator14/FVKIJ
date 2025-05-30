//Aqui se van a colocar las configuraciones para inicio de sesion y registro de usuarios.
const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const User = require('../models/user');
const Assignment = require('../models/equipment');

// Perfil de estudiante
router.get('/student/dashboard', isAuthenticated, async (req, res) => {
  try {
    const isSolvent = await req.user.isSolvent(); // Implementar en modelo User
    
    res.render('dashboard', {
      layout: 'kenshin',
      isStudent: true,
      currentUser: req.user,
      showSolvencyWarning: !isSolvent
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar el panel');
    res.redirect('/');
  }
});


router.get('/profile/:id', isAuthenticated, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    
    res.render('kenshin/profile', {
      layout: 'kenshin',
      student
    });
  } catch (error) {
    req.flash('error_msg', 'Estudiante no encontrado');
    res.redirect('/student/dashboard');
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


module.exports = router;