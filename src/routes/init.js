const { STATUS_CODES } = require('http');
//Aquí se colocan las rutas para la parte principal del sistema, los demás están en los siguientes archivos.
const router = require('express').Router(); //Solicitamos el enrutador.

//Solicitamos la página principal y la devolvemos en respuesta.
router.get('/', (req, res) => {
    res.render('index'); //Devolveremos esta vista
});

router.post('/login', async (req, res) => {
    const { email, password } = req;

    if(!email || !password) {
        return res.status(400).end(STATUS_CODES[400]);
    }

    try {
        const user = await User.findOne({ email });
        if(user.matchPassword(password)) {
            return res.redirect('/kenshin');
        }
        return 
    } catch (err) {
        return res.status(402).end(STATUS_CODES[402]);
    }
    
})

//Ir al formulario de registro
router.get('/register', (req, res) => {
    res.render('register');
});

//Para el registro del dojo
router.post('/register', async (req, res) => { //Declaramos un proceso asincrono
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
        res.render('dojos/dsignup', {errors, DojoName, DojoEmail, DojoRIF, DojoPassword, PasswordConfirmation, DojoFoundation, DojoAddress, FounderName, FounderEmail, FounderID, artes, grados});
    } else { //Sino, revisamos si no existe un email ya registrado
        try { 
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
        } catch (e) {
            res.end(e)
        }
    }
});


//Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization')
    req.flash('success_msg', 'Salida satisfactoria del sistema');
    res.redirect('/');
});


//Exportamos todo para su uso en el archivo principal.
module.exports = router;