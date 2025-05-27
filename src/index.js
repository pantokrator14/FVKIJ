const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

// Configuración de la base de datos
const connectDB = require('./config/database');

// Configuración de Handlebars
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'), // Ruta exacta
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views')); 

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
app.use('/equipos', require('./routes/asignacion'));
app.use('/pago', require('./routes/pago'));
app.use('/student', require('./routes/kenshin'));
app.use('/dojo', require('./routes/dojo'));
app.use('/FVK', require('./routes/admin'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
const PORT = process.env.PORT || 3000;  // <-- Se define el puerto aquí

// Iniciar servidor después de conectar a MongoDB
connectDB().then(() => {
    app.listen(PORT, () => {  
        console.log('🚀 Servidor conectado en puerto:', PORT);
        console.log('Ruta de layouts:', path.join(__dirname, 'views/layouts'));
    });
});