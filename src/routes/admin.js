//Rutas y funciones para los administradores del sistema. Para más información detallada acerca de rutas y eso, revisar los demas archivos de esta carpeta...
//Solicitamos:
const router = require('express').Router(); //Enrutador
const passport = require('passport'); //Para login y esas cosas.

const Admin = require('../models/administrator'); //Modelo de datos

const { isAuthenticated } = require('../helpers/auth'); //Para asegurarnos de que se está identificado.

//-----------------------------------------------------------------------------
//Registro de administradores(TEMPORAL)
router.get('/AdminRegister', (req, res) => {
    res.render('admin/register');
});
router.post('/Register', (req, res) => {
    const errors = []; //Que tomara una lista de errores los cuales se mostraran en el formulario
    //Solicitamos la informacion del formulario
    const {cargo, password, correo, permisos} = req.body;
    
    //Empezamos a definir los errores
    if(!cargo){ //Si no se escribio el cargo
        errors.push({text : 'Ingrese un cargo.'}); //Mandar este mensaje
    }
    if(!password){ //Si no se ingreso contraseña
        errors.push({text : 'Escriba una contraseña.'});
    }
    if(password.length < 4 || contraseña.length > 12){ //Si la longitud de la contraseña es menor a 4 digitos o mayor a 12
        errors.push({text : 'La contraseña debe ser mayor a 4 digitos y menor que 12.'});
    }
    if(!correo){ //Si no se escribio el correo
        errors.push({text : 'Ingrese correo electronico de su cargo.'});
    }

    if(!permisos){ //Si no ingresa sus permisos
        errors.push({text : 'Ingrese la permisologia.'});
    }
    //Ahora, si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redigirimos al formulario de registro mostrando los errores
        res.render('admin/register', {errors, cargo, contraseña, permisos});
    } else { //Sino, revisamos si no existe un cargo ya registrado 
        const cargoAdmin = await Admin.findOne({cargo : cargo});
        //Si existe
        if(cargoAdmin){
            req.flash('error_msg', 'Ya existe un cargo registrado.'); //Enviamos este mensaje
            res.redirect('admin/register'); //Y redireccionamos
        } else { //Finalmente, si no ha ocurrido nada de eso, registramos
            //Guardamos todo en un nuevo objeto
            const newAdmin = new admin({cargo, contraseña, permisos});
            //Encriptamos la contraseña
            newAdmin.contraseña = await newAdmin.encryptPassword(contraseña);
            //Guardamos
            await newAdmin.save();
            console.log(newAdmin); //Mostramos por consola los datos para verificar
            //enviar mensaje
            req.flash('success_msg', 'El admin ha sido registrado con exito. Puede ingresar.');
            //Redireccionamos a la pagina de inicio
            res.redirect('admin/register');
        }
    }
});
//-----------------------------------------------------------------------------------------------

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