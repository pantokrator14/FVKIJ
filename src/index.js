//Dependencias
const express = require('express'); //Para el servidor y la sintaxis.
const directorios = require('path'); //Esto nos permite hacer que node pueda buscar las vistas siguiendo los directorios del SO
const handlebars = require('express-handlebars'); //Este será el motor de plantillas para html
const method = require('method-override'); //Permite el uso de otros métodos diferentes al post y get para formularios
const session = require('express-session'); //Para guardar temporalmente las acciones de los usuarios en forma de sesiones.
const flash = require('connect-flash'); //Esto es para mostrar mensajes
const passport = require('passport');
//Inicializamos el servidor y anexamos las configuraciones de la base de datos y passport
const app = express(); //Usamos express
//Configuramos las sesiones
app.use(session({
    secret: process.env.SECRET || 'endogeno', //Palabra secreta
    resave: true, //Configuraciones básicas, indagar.
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/database'); //Solicitamos la base de datos
require('./config/authentication'); //Solicitamos la configuración de passport para las autenticaciones de usuario

//Configuraciones iniciales
app.set('port', process.env.PORT || 3000); //Solicitamos un puerto para funcionar. Si el SO no tiene uno, asignar el 3000.
app.set('views', directorios.join(__dirname, 'views')); //Esto le dirá al servidor que las vistas (html) se encuentran en la carpeta views. El dirname buscará este mismo archivo y el views indica la siguiente carpeta a buscar. ambas se juntan con el join.

//Configuración del handlebars
app.engine('.hbs', handlebars({
    defaultLayout: 'main', //Define como vista principal a main
    layoutsDir : directorios.join(app.get('views'), 'layouts'), //Al cual puedes encontrar en esta direccion
    partialsDir : directorios.join(app.get('views'), 'partials'), //Los partials son pequeñas partes de código que se repiten, a diferencia del anterior.
    extname: '.hbs' //Y las extensiones de estos archivos son...
}));
app.set('view engine', '.hbs'); //terminamos por declarar al handlebars como motor de plantillas del server 

//Aquí se declararan funciones que se realizaran antes de enviar a las rutas. Son como avisos o mensajes.
app.use(express.urlencoded({extended: false})); //Con esto permitiremos al servidor recibir y leer los datos de los formularios, los cuales no van a contener imagenes
app.use(method('_method')); //Lo usaremos para los metodos put y delete en formularios de edicion.

app.use(flash()); //El servidor usara flash para mensajes.


//Declaramos los mensjaes que vamos a usar a lo largo del programa
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg'); //mensaje de exito
    res.locals.error_msg = req.flash('error_msg'); //mensaje de error
    res.locals.error = req.flash('error');
    //res.locals.user = req.user || null;
    next(); //Para pasar a las tareas de abajo una vez declaradas
});



//Enviamos a la pagina de inicio una vez el servidor corra, requiriendo el archivo de rutas
app.use(require('./routes/init')); //Rutas para logins y registros
app.use(require('./routes/asignacion')); //Opciones y rutas de las asignaciones
app.use(require('./routes/pago')); //Opciones y rutas para los pagos
app.use(require('./routes/kenshin')); //Opciones y rutas de los kenshin
app.use(require('./routes/dojo')); //Opciones y rutas de los dojos
app.use(require('./routes/admin')); //Rutas para el admin


//Solciitamos la carpeta donde estan los archivos estaticos, que si imagenes y estilos
app.use(express.static(directorios.join(__dirname, 'public'))); //Es igual que el de los views y eso.
 
//Finalmente inicializamos el servidor
app.listen(app.get('port'), () => {
    console.log('Servidor conectado en el puerto:', app.get('port'));
});