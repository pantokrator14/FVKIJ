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
  const { type, amount, description, to } = req.body;
  
  const newPayment = new Payment({
    type,
    amount,
    description,
    from: req.user._id,
    fromModel: req.user.role === 'dojo' ? 'Dojo' : 'User',
    to: to || 'FVK', // ID de la federación
    toModel: req.user.role === 'admin' ? 'FVK' : 'Dojo'
  });

  await newPayment.save();
  res.redirect(`/pagos/${type === 'ingreso' ? 'ingresos' : 'egresos'}`);
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