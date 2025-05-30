//Aqui se van a colocar las configuraciones para inicio de sesion y registro de dojos, asi como su modificación y eliminación.
const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const User = require('../models/user');
const Dojo = require('../models/dojo');
const Payment = require('../models/payment');

// Middleware para verificar rol de dojo
const isDojoRole = (req, res, next) => {
  if (req.user && req.user.role === 'dojo') {
    return next();
  }
  req.flash('error_msg', 'Acceso no autorizado');
  res.redirect('/');
};

// Panel del dojo
router.get('/dojo/dashboard', isAuthenticated, isDojoRole, async (req, res) => {
  try {
    const dojo = await Dojo.findById(req.user.dojoInfo._id);
    const isSolvent = await dojo.isSolvent();
    
    res.render('dashboard', {
      layout: 'dojo',
      isDojo: true,
      currentUser: req.user,
      showSolvencyWarning: !isSolvent
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar el panel');
    res.redirect('/');
  }
});

// Lista de miembros
router.get('/dojo/members', isAuthenticated, isDojoRole, async (req, res) => {
  try {
    const members = await User.find({ 
      'dojo._id': req.user.dojoInfo._id 
    }).sort({ createdAt: -1 });
    
    res.render('dojo/members', {
      layout: 'dojo',
      members,
      dojoId: req.user.dojoInfo._id
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar miembros');
    res.redirect('/dojo/dashboard');
  }
});

// Registrar nuevo miembro
router.post('/dojo/members', isAuthenticated, isDojoRole, async (req, res) => {
  const { name, identification, email, password, birthdate, gender, height, weight, address, grade } = req.body;
  
  try {
    const newUser = new User({
      name,
      identification,
      email,
      password,
      birthdate: new Date(birthdate),
      gender,
      height,
      weight,
      address,
      grade: {
        name: grade,
        obtainedAt: new Date()
      },
      role: 'kenshin',
      dojo: {
        _id: req.user.dojoInfo._id,
        name: req.user.dojoInfo.name
      }
    });
    
    await newUser.save();
    req.flash('success_msg', 'Estudiante registrado exitosamente');
    res.redirect('/dojo/members');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al registrar estudiante');
    res.redirect('/dojo/members');
  }
});

// Actualizar información del dojo
router.put('/dojo/update', isAuthenticated, isDojoRole, async (req, res) => {
  try {
    const { name, rif, arts, contactEmail, address, phone } = req.body;
    
    const updatedDojo = await Dojo.findByIdAndUpdate(
      req.user.dojoInfo._id,
      {
        name,
        rif,
        arts: arts.split(','),
        contactEmail,
        address,
        phone
      },
      { new: true }
    );
    
    // Actualizar también en el usuario
    await User.findByIdAndUpdate(req.user._id, {
      'dojoInfo.name': updatedDojo.name
    });
    
    req.flash('success_msg', 'Información actualizada correctamente');
    res.redirect('/dojo/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar información');
    res.redirect('/dojo/config');
  }
});

module.exports = router;