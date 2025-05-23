const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const initDB = require('./config/database');

const app = express();

// Configuración de la base de datos
initDB();

// Configuración de Handlebars
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser(process.env.SECRET || 'endogeno'));
app.use(session({
    secret: process.env.SECRET || 'endogeno',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(flash());

// Middleware de autenticación JWT
app.use((req, res, next) => {
    const token = req.signedCookies.authorization;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET || 'endogeno');
            req.user = decoded;
        } catch (error) {
            res.clearCookie('authorization');
        }
    }
    next();
});

// Variables globales para mensajes
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.user || null;
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
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});