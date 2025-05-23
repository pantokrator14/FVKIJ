//Aqui va toda la configuracion de las asignaciones. Creación, muestra, edición y eliminar.
const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../helpers/auth');
const Equipment = require('../models/equipment');

// Asignar equipo
router.post('/assign', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.body.equipmentId);
        equipment.asignadoA = req.body.userId;
        equipment.fechaAsignacion = Date.now();
        
        await equipment.save();
        req.flash('success_msg', 'Equipo asignado correctamente');
        res.redirect('/admin/equipment');
    } catch (error) {
        req.flash('error_msg', 'Error al asignar equipo');
        res.redirect('/admin/equipment');
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
        res.redirect('/admin/equipment');
    } catch (error) {
        req.flash('error_msg', 'Error al liberar equipo');
        res.redirect('/admin/equipment');
    }
});

module.exports = router;