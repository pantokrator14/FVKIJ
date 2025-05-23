const express = require('express');
const directorios = require('path');
const handlebars = require('express-handlebars');
const method = require('method-override');
const flash = require('connect-flash');
const initDB = require('./config/database');
const cookieParser = require('cookie-parser'); // Nuevo

const app = express();

// Configuración inicial
app.set('secret', process.env.SECRET || 'endogeno');
app.set('port', process.env.PORT || 3000);
app.set('views', directorios.join(__dirname, 'views'));

// Configuración de Handlebars
app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    layoutsDir: directorios.join(app.get('views'), 'layouts'),
    partialsDir: directorios.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Middlewares clave
app.use(express.urlencoded({ extended: false }));
app.use(method('_method'));
app.use(cookieParser(app.get('secret'))); // Cookie-Parser con secreto
app.use(flash());

// Mensajes Flash
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Rutas
app.use('/', require('./routes/init'));
app.use('/equipment', require('./routes/asignacion'));
app.use('/payment', require('./routes/pago'));
app.use('/kenshin', require('./routes/kenshin'));
app.use('/dojo', require('./routes/dojo'));
app.use('/admin', require('./routes/admin'));

// Archivos estáticos
app.use(express.static(directorios.join(__dirname, 'public')));

// Iniciar servidor
initDB((err, db) => {
    if (err) return process.exit(1);
    app.set('db', db);
    app.listen(app.get('port'), () => {
        console.log('Servidor conectado en el puerto:', app.get('port'));
    });
});