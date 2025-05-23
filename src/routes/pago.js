const router = require('express').Router();
const { isAuthenticated } = require('../helpers/auth');
const Payment = require('../models/payment');

// Registro de pago
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const newPayment = new Payment({
            ...req.body,
            registradoPor: req.user._id
        });
        
        await newPayment.save();
        req.flash('success_msg', 'Pago registrado exitosamente');
        res.redirect('/payment/history');
    } catch (error) {
        req.flash('error_msg', 'Error al registrar pago');
        res.redirect('/payment/create');
    }
});

// Historial de pagos
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const payments = await Payment.find({ 
            $or: [
                { emisor: req.user._id },
                { destinatario: req.user._id }
            ]
        }).populate('emisor destinatario');
        
        res.render('payment/history', {
            layout: 'main',
            payments
        });
    } catch (error) {
        req.flash('error_msg', 'Error al cargar historial');
        res.redirect('/dashboard');
    }
});

// Generar reporte PDF
router.get('/report/:id', isAuthenticated, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
                                     .populate('emisor destinatario');
        
        // Lógica para generar PDF aquí
        req.flash('success_msg', 'Reporte generado');
        res.redirect(`/payment/history`);
    } catch (error) {
        req.flash('error_msg', 'Error al generar reporte');
        res.redirect(`/payment/history`);
    }
});

module.exports = router;