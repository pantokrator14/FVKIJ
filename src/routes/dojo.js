//Aqui se van a colocar las configuraciones apra inicio de sesion y registro de dojos, asi como su modificación y eliminación.
const router = require('express').Router(); //Solicitamos el enrutador.
const passport = require('passport'); // solicitamos el passport para hacer las validaciones.

//Requerimos ahora el modelo que creamos para los dojos
const dojo = require('../models/dojos');
const usuario = require('../models/usuarios'); //Modelo de usuario

const { isAuthenticated } = require('../helpers/auth'); //Para asegurarnos de que se esta autenticado para realizar las acciones


//Para el registro del dojo
router.post('/dsignup', async (req, res) => { //Declaramos un proceso asincrono
    const errors = []; //Que tomara una lista de errores los cuales se mostraran en el formulario
    //Solicitamos la informacion del formulario
    const {DojoName, DojoEmail, DojoRIF, DojoPassword, PasswordConfirmation, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados} = req.body;
    
    //Empezamos a definir los errores
    if(!DojoName){ //Si no se escribio el nombre
        errors.push({text : 'El dojo debe tener un nombre.'}); //Mandar este mensaje
    }
    if(!DojoEmail){ //Si no se escribe un correo
        errors.push({text : 'Ingrese un correo electronico.'});
    }
    if(!DojoPassword){ //Si no se ingreso contraseña
        errors.push({text : 'Escriba una contraseña.'});
    }
    if(DojoPassword.length < 4 || DojoPassword.length > 12){ //Si la longitud de la contraseña es menor a 4 digitos o mayor a 12
        errors.push({text : 'La contraseña debe ser mayor a 4 digitos y menor que 12.'});
    }
    if(DojoPassword != PasswordConfirmation){ //Si las contraseñas no son iguales
        errors.push({text : 'Las contraseñas no coinciden.'});
    }
    if(!DojoRIF){ //Si no se escribio un RIF
        errors.push({text : 'Ingrese su RIF.'});
    }
    if(DojoRIF.length != 9){ //Si el RIF es mayor o menor a 9 digitos
        errors.push({text : 'El RIF debe ser exactamente de 9 digitos.'});
    }
    if(!DojoFoundation){ //Si no hay fecha de fundacion
        errors.push({text : 'Ingrese la fecha de fundacion de su dojo.'});
    }
    if(!DojoAddress){ // Si no hay direccion
        errors.push({text : 'Ingrese la direccion de su dojo.'});
    }
    if(!FounderName){ //Si no hay nombre de fundador
        errors.push({text : 'Ingrese el nombre de su fundador.'});
    }
    if(!FounderEmail){ //Si no hay correo del fundador
        errors.push({text : 'Ingrese el correo electronico del fundador.'});
    }
    if(!FounderID){ //Si no hay cedula
        errors.push({text : 'Ingrese el numero de cedula del fundador.'});
    }
    //Ahora, si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redigirimos al formulario de registro mostrando los errores
        res.render('dsignup', {errors, DojoName, DojoEmail, DojoRIF, DojoPassword, PasswordConfirmation, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados});
    } else { //Sino, revisamos si no existe un email ya registrado 
        const emailDojo = await dojo.findOne({email : DojoEmail});
        //Si existe
        if(emailDojo){
            req.flash('error_msg', 'Ya existe un dojo registrado con ese correo electronico.'); //Enviamos este mensaje
            res.redirect('/users/signup'); //Y redireccionamos
        } else { //Finalmente, si no ha ocurrido nada de eso, registramos
            //Guardamos todo en un nuevo objeto
            const newDojo = new dojo({DojoName, DojoEmail, DojoRIF, DojoPassword, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados});
            //Encriptamos la contraseña
            newDojo.DojoPassword = await newDojo.encryptPassword(DojoPassword);
            //Guardamos
            await newDojo.save();
            console.log(newDojo); //Mostramos por consola el modelo guardado
            //enviar mensaje
            req.flash('success_msg', 'Su dojo ha sido registrado satisfactoriamente. Nuestros administradores le enviaran un correo confirmando su validacion.');
            //Redireccionamos a la pagina de inicio
            res.redirect('/');
        }
    }
});




//Página de inicio
router.get('/dojos/init', (req, res) => {
    res.render('dojos/dojo-init');
});

//---------------------------------------------------------------------------

//Mostrar los dojos (PARA ADMINS)
router.get('/FVK/list', isAuthenticated , async (req, res) => {
    const activeDojos = await dojo.find({solvente : true}).sort({ingresoAlSistema : 'desc'}); //Buscamos los dojos solventes
    const inactiveDojos = await dojo.find({solvente : false}).sort({ingresoAlSistema : 'desc'}); //Buscamos los dojos insolventes
    res.render('admin/dojo-list', {activeDojos}, {inactiveDojos}); //Redireccionamos a la página respectiva donde se mostraran. 
    //Sólo se mostraran las listas de dojos en la página de los administradores.
});

//-------------------------------------------------------------------------

//Mostrar usuarios en la pagina del dojo
router.get('/dojos/members', isAuthenticated, async (req, res) => {
    const activeDojos = await usuario.findById({$and : [{dojoID : req.dojo.id}, {solvente : true}]}).sort({creacion : 'desc'}); //Buscamos aquellos que pertenezcan al dojo y  esten solventes, de forma descendente de acuerdo a su ingreso al sistema
    const insolventes = await usuario.findById({$and : [{dojoID : req.dojo.id}, {solvente : false}]}).sort({creacion : 'desc'}); //Y aquellos que pertenecen pero no estan solventes, de forma descendente de acuerdo a su ingreso al sistema
    res.render('dojos/dojo-members', { activeDojos }, {insolventes}); //Y los mostramos en la vista.
});

//Mostrar solicitudes de nuevos dojos
router.get('/FVK/solicitudes',isAuthenticated, async (req, res) => {
    const newDojo = await dojo.find({activo : false}).sort({creacion : 'desc'}); //Buscamos dojos que no han sido activados aun
    res.render('admin/asignaciones', {newDojo}); //Y lo mostramos en la pagina
});

//-------------------------------------------------------------------------

//Modificar informacion

// Para la página de configuracion del dojo especifico
router.get('/dojo/config/:id', isAuthenticated, async (req, res) => {
    const data = await dojo.findById(req.params.id); //buscamos los datos del dojoo a traves de su id
    res.render('dojos/config', {data}); //Los ponemos en la vista para ser modificados
});

//Esto es para actualizar
router.put('/dojo/edit/:id', isAuthenticated, async (req, res) => {
    //Solicitamos la informacion del formulario
    const {DojoName, DojoEmail, DojoRIF, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados} = req.body;
    //Buscamos y modificamos.
    await dojo.findByIdAndUpdate(req.params.id, {DojoName, DojoEmail, DojoRIF, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados});
    req.flash('success_msg', 'Informacion modificada'); //Enviamos mensaje
    res.redirect('/dojos/init'); //Redireccionamos al inicio.
});

//Para declarar insolvencia (ADMIN)
router.put('/dojo/insolvencia/:id', isAuthenticated, async (req, res) => {
    await dojo.findByIdAndUpdate(req.params.id, { solvente : false }); //buscamos y actualizamos
    req.flash('success_msg', 'Dojo insolvente.'); //Mostramos mensaje
    res.redirect('/FVK/list'); //Redireccionamos
});

//Declarar solvencia (ADMIN, lo mismo que arriba)
router.put('/dojo/solvencia/:id', isAuthenticated, async (req, res) => {
    await dojo.findByIdAndUpdate(req.params.id, { solvente : true }); //buscamos y actualizamos
    req.flash('success_msg', 'Dojo solvente.'); //Mostramos mensaje
    res.redirect('/FVK/list'); //Redireccionamos
});

//Declarar acceso al sistema (ADMIN) 
router.put('/dojo/acceso/:id', isAuthenticated, async (req, res) => {
    await dojo.findByIdAndUpdate(req.params.id, { activo : true }); //buscamos y actualizamos
    req.flash('success_msg', 'Acceso al dojo autorizado.'); //Mostramos mensaje
    res.redirect('/FVK/list'); //Redireccionamos
});

//-------------------------------------------------------------------------

//Eliminar dojo (Sólo lo pueden hacer los admin)
router.delete('dojo/delete/:id', isAuthenticated, async (req, res) => {
    await dojo.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Dojo borrado satisfactoriamente');
    res.redirect('/dojos/members');
});

//-------------------------------------------------------------------------

//Para ingresar al sistema
router.post('/dinit', isAuthenticated, passport.authenticate('local', {
    successRedirect: '/dojos/init', //Si hay exito, redirecciona al panel del dojo
    failureRedirect: '/', //Sino reaparece en la misma página
    failureFlash: true //Investigar
}));

//Para salir del sistema
router.get('/dojos/logout', (req, res) => { //Indagar un poco
    req.logout(), //Realizamos el proceso de salida
    req.flash('success_msg', 'Salida satisfactoria'), //Dejar mensaje
    res.redirect('/') //Y Redireccionar a la pagina principal
});

//Exportamos todo para su uso en el archivo principal.
module.exports = router;