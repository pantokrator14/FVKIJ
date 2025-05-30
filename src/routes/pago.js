// routes/payments.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, checkPermissions } = require('../helpers/auth');
const Payment = require('../models/payment');

// Ruta universal para pagos
// Obtener todos los pagos de un tipo específico
router.get('/pago/:type(ingresos|egresos)', isAuthenticated, async (req, res) => {
  const { type } = req.params;
  const user = req.user;
  
  // Construir query dinámico
  const query = { 
    type: type === 'ingresos' ? 'ingreso' : 'egreso',
    $or: []
  };

  // Lógica para diferentes roles
  if (user.role === 'admin') {
    // Admins ven todos los pagos de la federación
    query.toModel = 'FVK';
  } else if (user.role === 'dojo') {
    // Dojos ven sus propias transacciones
    query.$or.push(
      { from: user._id, fromModel: 'Dojo' }, // Egresos del dojo
      { to: user._id, toModel: 'Dojo' } // Ingresos al dojo
    );
  }

  const payments = await Payment.find(query)
    .populate('from to')
    .sort('-date');

  res.render('payments/list', {
    payments,
    type,
    isAdmin: user.role === 'admin'
  });
});

// Crear nuevo pago
router.post('/pago/RealizarPago', isAuthenticated, async (req, res) => {
  const { type, amount, description, to, externalEntity } = req.body;
  
  try {
    const newPayment = new Payment({
      type,
      amount,
      description,
      status: 'pendiente',
      date: new Date()
    });

    // Asignar participantes según el rol
    switch(req.user.role) {
      case 'admin':
        if (type === 'ingreso') {
          // Ingresos a la federación (solo de dojos)
          newPayment.toModel = 'FVK';
          newPayment.from = to; // ID del dojo
          newPayment.fromModel = 'Dojo';
        } else {
          // Egresos de la federación (a entidades externas)
          newPayment.fromModel = 'FVK';
          
          // Si es una entidad externa
          if (externalEntity) {
            newPayment.toModel = 'External';
            newPayment.to = null;
            newPayment.externalEntity = externalEntity;
          } else {
            newPayment.toModel = to.startsWith('dojo_') ? 'Dojo' : 'User';
            newPayment.to = to;
          }
        }
      break;
        
      case 'dojo':
        if (type === 'ingreso') {
          // Ingresos al dojo (solo de kenshins)
          newPayment.toModel = 'Dojo';
          newPayment.to = req.user._id;
          newPayment.fromModel = 'User';
          newPayment.from = to; // ID del kenshin
        } else {
          // Egresos del dojo (a federación u otros)
          newPayment.fromModel = 'Dojo';
          newPayment.from = req.user._id;
          
          // Si es a la federación
          if (to === 'FVK') {
            newPayment.toModel = 'FVK';
          } else {
            // Entidades externas
            newPayment.toModel = 'External';
            newPayment.to = null;
            newPayment.externalEntity = externalEntity;
          }
        }
      break;

      case 'kenshin':
        newPayment.type = 'egreso';
        newPayment.fromModel = 'User';
        newPayment.from = req.user._id;
        newPayment.toModel = 'Dojo';
        
        // Obtener automáticamente el dojo del usuario
        if (!req.user.dojo || !req.user.dojo._id) {
          throw new Error('No tienes un dojo asignado');
        }
        newPayment.to = req.user.dojo._id;
      break;
    }

    await newPayment.save();
    req.flash('success_msg', 'Pago registrado exitosamente');
    res.redirect(`/pago/${type === 'ingreso' ? 'ingresos' : 'egresos'}`);
    } catch (error) {
      console.error(error);
      req.flash('error_msg', error.message || 'Error al registrar el pago');
      res.redirect('back');
    }
});

// Confirmar/Cancelar pagos (solo admin)
router.post('/pago/:id/:action(confirmar|cancelar)', 
  checkPermissions({ finanzas: true }), 
  async (req, res) => {
    const status = req.params.action === 'confirmar' 
      ? 'confirmado' 
      : 'cancelado';
    
    await Payment.findByIdAndUpdate(req.params.id, { status });
    res.redirect('back');
  }
);

module.exports = router;