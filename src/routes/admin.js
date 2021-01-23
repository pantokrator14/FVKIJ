//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
//Solicitamos:
const router = require('express').Router(); //Enrutador
const passport = require('passport'); //Para login y esas cosas.

const Admin = require('../models/administrator'); //Modelo de datos

const { isAuthenticated, isAdmin } = require('../helpers/auth'); //Para asegurarnos de que se está identificado.

//Mostramos la pagina de inicio.
router.get('/init', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/admin-init');
});

//-------------------------------------------------------------------------------

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Salida satisfactoria del sistema');
    res.redirect('/');
});

//--------------------------------------------------------------------------------

module.exports = router; //Finalmente exportamos