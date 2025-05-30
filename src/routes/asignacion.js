//Aqui va toda la configuracion de las asignaciones. Creación, muestra, edición y eliminar.
const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const Equipment = require('../models/equipment');
const User = require('../models/user');

// Middleware para verificar rol de administrador
const isAdminRole = (req, res, next) => {
  if (req.user && (req.user.role === 'secretario' || req.user.role === 'presidente')) {
    return next();
  }
  req.flash('error_msg', 'Acceso no autorizado');
  res.redirect('/');
};

// Vista de administrador para equipos
router.get('/FVK/equipos', isAuthenticated, isAdminRole, async (req, res) => {
  try {
    const equipments = await Equipment.find().populate('assignedTo');
    const kenshins = await User.find({ role: 'kenshin', solvente: true }).populate('dojo');
    
    res.render('admin/equipos', {
      layout: 'admin',
      equipments,
      kenshins
    });
  } catch (error) {
    req.flash('error_msg', 'Error al cargar equipos');
    res.redirect('/FVK/dashboard');
  }
});

// Vista para kenshins (sus equipos asignados)
router.get('/equipos', isAuthenticated, async (req, res) => {
  try {
    const equipments = await Equipment.find({ assignedTo: req.user._id });
    res.render('kenshin/list', {
      layout: 'kenshin',
      equipments
    });
  } catch (error) {
    req.flash('error_msg', 'Error al cargar tus equipos');
    res.redirect('/student/dashboard');
  }
});

// Crear nuevo equipo (Admin)
router.post('/FVK/equipos', isAuthenticated, isAdminRole, async (req, res) => {
  const { type, description, serialNumber } = req.body;
  
  try {
    const newEquipment = new Equipment({
      type,
      description,
      serialNumber
    });
    
    await newEquipment.save();
    req.flash('success_msg', 'Equipo registrado exitosamente');
    res.redirect('/admin/equipos');
  } catch (error) {
    req.flash('error_msg', 'Error al registrar equipo: ' + error.message);
    res.redirect('/admin/equipos');
  }
});

// Asignar equipo a kenshin (Admin)
router.post('/FVK/equipos/asignar/:id', isAuthenticated, isAdminRole, async (req, res) => {
  const { kenshinId } = req.body;
  
  try {
    // Verificar que el kenshin existe y es solvente
    const kenshin = await User.findById(kenshinId);
    if (!kenshin || !kenshin.solvente) {
      throw new Error('El kenshin no existe o no está solvente');
    }
    
    // Actualizar equipo
    await Equipment.findByIdAndUpdate(req.params.id, {
      assignedTo: kenshinId,
      assignedBy: req.user._id,
      dateAssigned: new Date(),
      status: 'asignado'
    });
    
    req.flash('success_msg', 'Equipo asignado exitosamente');
    res.redirect('/admin/equipos');
  } catch (error) {
    req.flash('error_msg', 'Error al asignar equipo: ' + error.message);
    res.redirect('/admin/equipos');
  }
});

// Liberar equipo (Admin)
router.post('/FVK/equipos/liberar/:id', isAuthenticated, isAdminRole, async (req, res) => {
  try {
    await Equipment.findByIdAndUpdate(req.params.id, {
      assignedTo: null,
      assignedBy: null,
      dateAssigned: null,
      status: 'disponible'
    });
    
    req.flash('success_msg', 'Equipo liberado');
    res.redirect('/admin/equipos');
  } catch (error) {
    req.flash('error_msg', 'Error al liberar equipo');
    res.redirect('/admin/equipos');
  }
});

// Eliminar equipo (Admin)
router.delete('/FVK/equipos/:id', isAuthenticated, isAdminRole, async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Equipo eliminado');
    res.redirect('/admin/equipos');
  } catch (error) {
    req.flash('error_msg', 'Error al eliminar equipo');
    res.redirect('/admin/equipos');
  }
});

module.exports = router;