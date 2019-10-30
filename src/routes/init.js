//Aquí se colocan las rutas para la parte principal del sistema, los demás están en los siguientes archivos.
const router = require('express').Router(); //Solicitamos el enrutador.

//Solicitamos la página principal y la devolvemos en respuesta.
router.get('/', (req, res, next) => {
    res.render('index'); //Devolveremos esta vista
});

//Ir al formulario de registro de dojos
router.get('/dsignup', (req, res, next) => {
    res.render('dojos/dsignup');
});


//Exportamos todo para su uso en el archivo principal.
module.exports = router;