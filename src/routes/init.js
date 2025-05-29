const { STATUS_CODES } = require('http');
const router = require('express').Router();
const Dojo = require('../models/dojo');
const Admin = require('../models/admin');
const User = require('../models/user');
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
  const models = { Admin, Dojo, User };
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
    admin: '/FVK/dashboard',
    dojo: '/dojo/dashboard',
    student: '/kenshin/dashboard'
  };

  res.redirect(redirectPaths[user.role]);
});



// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization');
    req.flash('success_msg', 'Sesión cerrada');
    res.redirect('/');
});

module.exports = router; // ¡Exportación correcta del router!