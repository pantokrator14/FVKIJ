const { STATUS_CODES } = require('http');
const router = require('express').Router();
const Dojo = require('../models/dojo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ruta principal: Página de inicio
router.get('/', (req, res) => {
    res.render('index');
});


// Ruta de login (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar en todas las colecciones
  const models = { User, Dojo, Student };
  let user;

  for (const model of Object.values(models)) {
    user = await model.findOne({ email }).select('+password');
    if (user) break;
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).render('login', { error: 'Credenciales inválidas' });
  }

  const tokenPayload = {
    _id: user._id,
    role: user.role,
    adminType: user.adminType,
    permissions: user.permissions
  };

  const token = jwt.sign(tokenPayload, process.env.SECRET, { expiresIn: '4h' });
  
  res.cookie('authorization', token, {
    httpOnly: true,
    signed: true,
    maxAge: 14400000 // 4 horas
  });

  // Redirección según rol
  const redirectPaths = {
    admin: '/admin/dashboard',
    dojo: '/dojo/dashboard',
    student: '/student/profile'
  };

  res.redirect(redirectPaths[user.role]);
});

// Ruta de registro (GET)
router.get('/register', (req, res) => {
    res.render('register');
});

// Ruta de registro (POST)
router.post('/register', async (req, res) => {
    const errors = [];
    const { 
        DojoName, 
        DojoEmail, 
        DojoPassword, 
        PasswordConfirmation 
    } = req.body;

    // Validaciones básicas
    if (!DojoName) errors.push({ text: 'Nombre del dojo requerido' });
    if (!DojoEmail) errors.push({ text: 'Correo requerido' });
    if (DojoPassword !== PasswordConfirmation) errors.push({ text: 'Contraseñas no coinciden' });

    if (errors.length > 0) {
        return res.render('register', { errors, ...req.body });
    }

    try {
        const hashedPassword = bcrypt.hashSync(DojoPassword, 10);
        const newDojo = new Dojo({
            DojoName,
            DojoEmail,
            DojoPassword: hashedPassword,
            activo: false,
            solvente: false
        });

        await newDojo.save();
        req.flash('success_msg', 'Registro exitoso. Espere validación.');
        res.redirect('/');

    } catch (error) {
        if (error.code === 11000) {
            req.flash('error_msg', 'Correo ya registrado');
        } else {
            req.flash('error_msg', 'Error en el servidor');
        }
        res.redirect('/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization');
    req.flash('success_msg', 'Sesión cerrada');
    res.redirect('/');
});

module.exports = router; // ¡Exportación correcta del router!