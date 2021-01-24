const { STATUS_CODES } = require('http');
//Aqui se van a colocar las configuraciones apra inicio de sesion y registro de dojos, asi como su modificación y eliminación.
const router = require('express').Router(); //Solicitamos el enrutador.
const passport = require('passport'); // solicitamos el passport para hacer las validaciones.

//Requerimos ahora el modelo que creamos para los dojos
const Dojo = require('../models/dojo');
const usuario = require('../models/user'); //Modelo de usuario

const { isAuthenticated, isAdmin } = require('../helpers/auth'); //Para asegurarnos de que se esta autenticado para realizar las acciones

// get all dojos
router.get('/', async (req, res) => {
    try {
        const dojos = await Dojo.find({ active: true });
        return res.status(200).json(dojos);
    } catch(err) {
        return res.status(400).end(STATUS_CODES[400]);
    }
});

//---------------------------------------------------------------------------

//Mostrar los dojos (PARA ADMINS)
router.get('/FVK/list', isAuthenticated, isAdmin, async (req, res) => {
    const activeDojos = await dojo.find({solvente : true}).sort({ingresoAlSistema : 'desc'}); //Buscamos los dojos solventes
    const inactiveDojos = await dojo.find({solvente : false}).sort({ingresoAlSistema : 'desc'}); //Buscamos los dojos insolventes
    res.render('admin/dojolist', {activeDojos, inactiveDojos}); //Redireccionamos a la página respectiva donde se mostraran. 
    //Sólo se mostraran las listas de dojos en la página de los administradores.
});

//-------------------------------------------------------------------------

//Mostrar usuarios en la pagina del dojo
router.get('/dojos/members', isAuthenticated, async (req, res) => {
    const dojoId = req.user._id
    const activeUsers = await usuario.find({dojoID : dojoId, solvente : true}).sort({creacion : 'desc'}); //Buscamos aquellos que pertenezcan al dojo y  esten solventes, de forma descendente de acuerdo a su ingreso al sistema
    const insolventes = await usuario.find({dojoID : dojoId, solvente : false}).sort({creacion : 'desc'}); //Y aquellos que pertenecen pero no estan solventes, de forma descendente de acuerdo a su ingreso al sistema
    res.render('dojos/dojo-members', {activeUsers, insolventes}); //Y los mostramos en la vista.
});

//Mostrar solicitudes de nuevos dojos
router.get('/FVK/solicitudes',isAuthenticated, async (req, res) => {
    const newDojo = await dojo.find({activo : false}).sort({creacion : 'desc'}); //Buscamos dojos que no han sido activados aun
    res.render('admin/solicitudes', {newDojo}); //Y lo mostramos en la pagina
});

//-------------------------------------------------------------------------

//Modificar informacion
router.get('/config', isAuthenticated, async (req, res) => {
    const data = req.user
    res.render('dojos/config', {data})
})

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
router.put('/solvencia/:id', isAuthenticated, async (req, res) => {
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
router.post('/dinit', passport.authenticate('dojolocal', {
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