//Aqui va toda la configuracion de las asignaciones. Creación, muestra, edición y eliminar.
const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../helpers/auth');
const Equipment = require('../models/equipment');

router.get('/', isAuthenticated, async (req, res) => {
  const query = req.user.role === 'admin' 
    ? {} 
    : { kenshin: req.user._id };

  const assignments = await Assignment.find(query)
    .populate('kenshin assignedBy');
  
  res.render('assignments/list', {
    assignments,
    isAdmin: req.user.role === 'admin'
  });
});

// Asignar equipo
router.post('/asignaciones/nuevoequipo', isAuthenticated, async (req, res) => {
  try {
    const { tipo, descripcion, responsable } = req.body;
    const newEquipment = new Equipment({ tipo, descripcion, responsable });
    
    await newEquipment.save();
    req.flash('success_msg', 'Equipo registrado exitosamente');
    res.redirect('/equipment');
    
  } catch (error) {
    req.flash('error_msg', 'Error al registrar equipo');
    res.redirect('/asignaciones');
  }
});
// Liberar equipo
router.post('/release/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Equipment.findByIdAndUpdate(req.params.id, {
            asignadoA: null,
            fechaAsignacion: null
        });
        
        req.flash('success_msg', 'Equipo liberado');
        res.redirect('/FVK/Equipos');
    } catch (error) {
        req.flash('error_msg', 'Error al liberar equipo');
        res.redirect('/FVK/equipos');
    }
});

module.exports = router;