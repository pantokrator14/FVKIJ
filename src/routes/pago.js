// routes/payments.js
const router = require('express').Router();
const { isAuthenticated, checkPermissions } = require('../helpers/auth');
const Payment = require('../models/payment');

// Ruta universal para pagos
router.get('/:type(ingresos|egresos)', isAuthenticated, async (req, res) => {
  const { type } = req.params;
  const user = req.user;
  
  const query = { 
    type: type === 'ingresos' ? 'ingreso' : 'egreso',
    $or: [
      { from: user._id },
      { to: user._id }
    ]
  };

  if (user.role === 'admin') {
    delete query.$or;
    query.toModel = 'Federation';
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

// Confirmar/Cancelar pagos (solo admin)
router.post('/:id/:action(confirmar|cancelar)', 
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