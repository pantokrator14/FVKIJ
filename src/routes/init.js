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

//Ir al formulario de registro de dojos
router.get('/register', (req, res) => {
    res.render('register');
});

//Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization')
    req.flash('success_msg', 'Salida satisfactoria del sistema');
    res.redirect('/');
});


//Exportamos todo para su uso en el archivo principal.
module.exports = router;