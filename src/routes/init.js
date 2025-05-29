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

  // Buscar solo en el modelo unificado User
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).render('login', { error: 'Credenciales inválidas' });
  }

  // Payload simplificado
  const tokenPayload = {
    _id: user._id,
    role: user.role,
    name: user.name
  };

  const token = jwt.sign(tokenPayload, process.env.SECRET, { expiresIn: '4h' });
  
  res.cookie('authorization', token, {
    httpOnly: true,
    signed: true,
    maxAge: 14400000 // 4 horas
  });

  // Redirección según rol
  const redirectPaths = {
    secretario: '/FVK/dashboard',
    tesorero: '/FVK/dashboard',
    presidente: '/FVK/dashboard',
    dojo: '/dojo/dashboard',
    kenshin: '/student/dashboard' // Corregido a 'kenshin'
  };

  res.redirect(redirectPaths[user.role] || '/');
});



// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization');
    req.flash('success_msg', 'Sesión cerrada');
    res.redirect('/');
});

module.exports = router; // ¡Exportación correcta del router!