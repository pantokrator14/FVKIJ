//Aqui va la configuracion para los pagos. Es similar al resto.
const router = require('express').Router(); //Enrutador

//Modelo de datos
const pago = require('../models/pagos');

const { isAuthenticated } = require('../helpers/auth'); //Para asegurarse de que se esta autenticado para realizar las acciones.

//NOTA:  Vamos a repetir el mismo código de registro y muestra tanto de egresos como de ingresos, no sé qué método puede evitar esta repeticion de codigo, pero una vez lo sepa, lo acomodaré.

//----------------------------------------------------------

//DOJO
//Ingresos 


//------------------------------------------
//Mostrar ingresos
router.get('/dojos/ingresos', isAuthenticated, async (req, res) => {
    const ingresos = await pago.find({destinatario : req.params.id});
    res.render('dojos/ingresos', {ingresos}); //Pagina para ingresos
});

//Crear ingreso
router.post('/dojos/ingresos', isAuthenticated, async (req, res) => { //Proceso asincrono
    const errors = []; //Lista de errores
    const  {emisor, cantidad, descripcion} = req.body; //solicitamos del formulario los datos.

    //validacion de errores
    if(!emisor) { //Si no hay emisor
        errors.push({text : 'Debe ingresar el emisor'}); //Guarda error en el arreglo para mostrar más tarde.
    }
    if (!cantidad) { //Si no hay cantidad
        errors.push({text : 'Debe ingresar la cantidad'});
    }
    if (!descripcion) { //Si no hay descripcion
        errors.push({text : 'Debe ingresar una descripcion'});
    }
    //Ahora si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redirigimos a la página de ingresos y se muestran los errores
        res.render('/dojos/ingresos', {errors, emisor, cantidad, descripcion});
    } else { //Sino, creamos el registro
        const newPago = new pago({
            emisor, 
            cantidad, 
            descripcion
        });
        newPago.destinatario = req.user.id; //El destinatario sera el usuario
        await newPago.save(); //Guardamos
        req.flash('success_msg', 'Ingreso registrado correctamente.') //Mostramos el mensaje
        res.redirect('/dojos/ingresos'); //Y redireccionamos a la pagina
    }
});

//-----------------------------------------------

//Egresos
router.get('/dojos/egresos', isAuthenticated, async (req, res) => {
    const egresos = await pago.find({emisor : req.params.id});
    res.render('dojos/egresos', {egresos}); //Pagina para ingresos
});

//Crear Egreso
router.post('/dojos/egresos', isAuthenticated, async (req, res) => { //Proceso asincrono
    const errors = []; //Lista de errores
    const  {destinatario, cantidad, descripcion} = req.body; //solicitamos del formulario los datos.

    //validacion de errores
    if(!destinatario) { //Si no hay emisor
        errors.push({text : 'Debe ingresar el destinatario'}); //Guarda error en el arreglo para mostrar más tarde.
    }
    if (!cantidad) { //Si no hay cantidad
        errors.push({text : 'Debe ingresar la cantidad'});
    }
    if (!descripcion) { //Si no hay descripcion
        errors.push({text : 'Debe ingresar una descripcion'});
    }
    //Ahora si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redirigimos a la página de ingresos y se muestran los errores
        res.render('/dojos/egresos', {errors, destinatario, cantidad, descripcion});
    } else { //Sino, creamos el registro
        const newPago = new pago({
            destinatario, 
            cantidad, 
            descripcion
        });
        newPago.emisor = req.user.id; //El destinatario sera el usuario
        await newPago.save(); //Guardamos
        req.flash('success_msg', 'Ingreso registrado correctamente.') //Mostramos el mensaje
        res.redirect('/dojos/egresos'); //Y redireccionamos a la pagina
    }
});


//---------------------------------------------

//ADMIN
//Ingresos
//------------------------------------------
//Mostrar ingresos
router.get('/FVK/ingresos', isAuthenticated, async (req, res) => {
    const ingresos = await pago.find({destinatario : req.params.id});
    res.render('admin/FVK-ingresos', {ingresos}); //Pagina para ingresos
});

//Crear ingreso
router.post('/FVK/ingresos', isAuthenticated, async (req, res) => { //Proceso asincrono
    const errors = []; //Lista de errores
    const  {emisor, cantidad, descripcion} = req.body; //solicitamos del formulario los datos.

    //validacion de errores
    if(!emisor) { //Si no hay emisor
        errors.push({text : 'Debe ingresar el emisor'}); //Guarda error en el arreglo para mostrar más tarde.
    }
    if (!cantidad) { //Si no hay cantidad
        errors.push({text : 'Debe ingresar la cantidad'});
    }
    if (!descripcion) { //Si no hay descripcion
        errors.push({text : 'Debe ingresar una descripcion'});
    }
    //Ahora si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redirigimos a la página de ingresos y se muestran los errores
        res.render('/FVK/ingresos', {errors, emisor, cantidad, descripcion});
    } else { //Sino, creamos el registro
        const newPago = new pago({
            emisor, 
            cantidad, 
            descripcion
        });
        newPago.destinatario = req.user.id; //El destinatario sera el usuario
        await newPago.save(); //Guardamos
        req.flash('success_msg', 'Ingreso registrado correctamente.') //Mostramos el mensaje
        res.redirect('/FVK/ingresos'); //Y redireccionamos a la pagina
    }
});

//-----------------------------------------------

//Egresos
//Mostrar egresos
router.get('/FVK/egresos', isAuthenticated, async (req, res) => {
    const egresos = await pago.find({emisor : req.params.id});
    res.render('admin/FVK-egresos', {egresos}); //Pagina para egresos
});

//Crear Egreso
router.post('/FVK/egresos', isAuthenticated, async (req, res) => { //Proceso asincrono
    const errors = []; //Lista de errores
    const  {destinatario, cantidad, descripcion} = req.body; //solicitamos del formulario los datos.

    //validacion de errores
    if(!destinatario) { //Si no hay emisor
        errors.push({text : 'Debe ingresar el destinatario'}); //Guarda error en el arreglo para mostrar más tarde.
    }
    if (!cantidad) { //Si no hay cantidad
        errors.push({text : 'Debe ingresar la cantidad'});
    }
    if (!descripcion) { //Si no hay descripcion
        errors.push({text : 'Debe ingresar una descripcion'});
    }
    //Ahora si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redirigimos a la página de ingresos y se muestran los errores
        res.render(egresos, {errors, destinatario, cantidad, descripcion});
    } else { //Sino, creamos el registro
        const newPago = new pago({
            destinatario, 
            cantidad, 
            descripcion
        });
        newPago.emisor = req.user.id; //El destinatario sera el usuario
        await newPago.save(); //Guardamos
        req.flash('success_msg', 'Ingreso registrado correctamente.') //Mostramos el mensaje
        res.redirect('/FVK/egresos'); //Y redireccionamos a la pagina
    }
});

//---------------------------------------------------------




//Exportamos todo para usarlo en el archivo principal
module.exports = router;