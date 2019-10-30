//Aqui se van a colocar las configuraciones para inicio de sesion y registro de usuarios.
const router = require('express').Router(); //Solicitamos el enrutador.
const passport = require('passport'); // solicitamos el passport para hacer las validaciones.

//Requerimos ahora el modelo que creamos para los usuarios
const usuario = require('../models/usuarios');

const {isAuthenticated} = require('../helpers/auth'); //Usamos esto para asegurarnos de que se está autenticado para realizar las acciones

//Para el registro del usuario
router.post('/dojos/members/ingreso', isAuthenticated, async (req, res) => { //Declaramos un proceso asincrono
    const errors = []; //Que tomara una lista de errores los cuales se mostraran en el formulario
    //Solicitamos la informacion del formulario
    const {nombre, cedula, email, fechaNacimiento, contraseña, confirmacion, genero, grado, direccion, peso, tamaño} = req.body;
    
    //Empezamos a definir los errores
    if(!nombre){ //Si no se escribio el nombre
        errors.push({text : 'Ingrese un nombre.'}); //Mandar este mensaje
    }
    if(!cedula){ //Si no se la cedula
        errors.push({text : 'Ingrese la cedula de identidad.'});
    }
    if(!contraseña){ //Si no se ingreso contraseña
        errors.push({text : 'Escriba una contraseña.'});
    }
    if(contraseña.length < 4 || contraseña.length > 12){ //Si la longitud de la contraseña es menor a 4 digitos o mayor a 12
        errors.push({text : 'La contraseña debe ser mayor a 4 digitos y menor que 12.'});
    }
    if(contraseña != confirmacion){ //Si las contraseñas no son iguales
        errors.push({text : 'Las contraseñas no coinciden.'});
    }
    if(!email){ //Si no se escribio el correo
        errors.push({text : 'Ingrese correo electronico.'});
    }
    if(cedula.length != 8){ //Si la cedula es mayor o menor a 8 digitos
        errors.push({text : 'La cedula debe tener de 8 digitos.'});
    }
    if(!fechaNacimiento){ //Si no hay fecha de nacimiento
        errors.push({text : 'Ingrese la fecha de nacimiento del kenshi.'});
    }
    if(!grado){ // Si no hay grado
        errors.push({text : 'Ingrese el grado de instruccion del kenshi.'});
    }
    if(!genero){ //Si no se ha decidido el genero
        errors.push({text : 'Ingrese el genero del kenshi.'});
    }
    if(!direccion){
        errors.push({text : 'Ingrese una direccion.'});
    }
    if(!tamaño){
        errors.push({text : 'Ingrese la altura del kenshi.'});
    }
    if(!peso){
        errors.push({text : 'Ingrese el peso del kenshi.'});
    }
    //Ahora, si hay errores en la lista
    if(errors.length > 0){
        //Entonces nos redigirimos al formulario de registro mostrando los errores
        res.render('dojos/dojo-members', {errors, nombre, email, cedula, contraseña, confirmacion, fechaNacimiento, peso, tamaño, grado, genero, direccion});
    } else { //Sino, revisamos si no existe un email ya registrado 
        const emailUsuario = await usuario.findOne({email : email});
        //Si existe
        if(emailUsuario){
            req.flash('error_msg', 'Ya existe un dojo registrado con ese correo electronico.'); //Enviamos este mensaje
            res.redirect('dojos/dojo-members'); //Y redireccionamos
        } else { //Finalmente, si no ha ocurrido nada de eso, registramos
            //Guardamos todo en un nuevo objeto
            const newUser = new usuario({nombre, email, cedula, contraseña, fechaNacimiento, grado, genero, direccion, peso, tamaño});
            newUser.dojoID = req.dojo.id; //Ingresamos de forma automatica el id del dojo al que pertenece
            //Encriptamos la contraseña
            newUser.contraseña = await newUser.encryptPassword(contraseña);
            //Guardamos
            await newUser.save();
            console.log(newUser); //Mostramos por consola los datos para verificar
            //enviar mensaje
            req.flash('success_msg', 'El kenshin ha sido registrado con exito. Puede ingresar.');
            //Redireccionamos a la pagina de inicio
            res.redirect('dojos/dojo-members');
        }
    }
});

//-------------------------------------------------------------------------------------

// Para la página de inicio
router.get('/kenshi/init', isAuthenticated, (req, res) => {
    res.render('kenshis/kenshi-init');
});

//--------------------------------------------------------------------------------------------

// Para la página de configuracion del kenshi especifico
router.get('/config/:id', isAuthenticated, async (req, res) => {
    const data = await usuario.findById(req.params.id); //buscamos los datos del usuario a traves de su id
    res.render('kenshis/config', {data}); //Los ponemos en la vista para ser modificados
});

//Esto es para actualizar
router.put('/config/edit/:id', isAuthenticated, async (req, res) => {
    //Solicitamos la informacion del formulario
    const {nombre, cedula, email, fechaNacimiento, genero, grado, direccion, peso, tamaño} = req.body;
    //Buscamos y modificamos.
    await usuario.findByIdAndUpdate(req.params.id, {nombre, cedula, email, fechaNacimiento, genero, grado, direccion, peso, tamaño});
    req.flash('success_msg', 'Informacion modificada'); //Enviamos mensaje
    res.redirect('/kenshi/init'); //Redireccionamos al inicio.
});


//Para declarar solvencia (DOJOS)
router.put('/miembro/solvencia/:id', isAuthenticated, async (req, res) => {
    await usuario.findByIdAndUpdate(req.params.id, { solvente : true }); //buscamos y actualizamos
    req.flash('success_msg', 'Acceso al dojo autorizado.'); //Mostramos mensaje
    res.redirect('/dojos/members'); //Redireccionamos
});

//Declarar insolvencia (DOJOS)
router.put('/miembro/insolvencia/:id', isAuthenticated, async (req, res) => {
    await usuario.findByIdAndUpdate(req.params.id, { solvente : false }); //buscamos y actualizamos
    req.flash('success_msg', 'Acceso al dojo autorizado.'); //Mostramos mensaje
    res.redirect('/dojos/members'); //Redireccionamos
});


//---------------------------------------------------------------------


//Eliminar usuario (Sólo lo pueden hacer los dojos)
router.delete('miembro/delete/:id', isAuthenticated, async (req, res) => {
    await usuario.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario borrado satisfactoriamente');
  res.redirect('/dojos/members');
});

//---------------------------------------------------------------------


//Para el login de usuario
router.post('/kinit', passport.authenticate('local', {
        successRedirect: '/kenshi/init', //Si hay exito, redirecciona al panel del usuario
        failureRedirect: '/', //Sino reaparece en la misma página
        failureFlash: true //Investigar
}));


//Logout
router.get('/users/logout', (req, res) => { //Indagar un poco
    req.logout(), //Realizamos el proceso de salida
    req.flash('success_msg', 'Salida satisfactoria'), //Dejar mensaje
    res.redirect('/') //Y Redireccionar a la pagina principal
});

//----------------------------------------------------------------------

module.exports = router;