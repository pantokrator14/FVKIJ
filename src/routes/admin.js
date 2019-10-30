//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
//Solicitamos:
const router = require('express').Router(); //Enrutador
const passport = require('passport'); //Para login y esas cosas.

const { isAuthenticated } = require('../helpers/auth'); //Para asegurarnos de que se está identificado.

//Registro de administradores(TEMPORAL)
router.get('/AdminRegister', (req, res) => {
    res.render('admin/register');
});
router.post('/Register', (req, res) => {
    
});


//Mostramos la pagina de inicio.
router.get('/FVK/init', isAuthenticated, (req, res) => {
    res.render('admin/admin-init');
});

//-------------------------------------------------------------------------------

//Login
router.post('/ainit', passport.authenticate('local', {
    successRedirect: '/FVK/init',
    failureRedirect: '/',
    failureFlash: true
  }));


//Logout
router.get('/admin/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Salida satisfactoria del sistema');
    res.redirect('/');
});

//--------------------------------------------------------------------------------

module.exports = router; //Finalmente exportamos