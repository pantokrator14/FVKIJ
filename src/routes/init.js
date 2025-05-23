const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Dojo = require('../models/dojo');
const bcrypt = require('bcryptjs');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const dojo = await Dojo.findOne({ DojoEmail: email });
        
        if (!dojo || !bcrypt.compareSync(password, dojo.DojoPassword)) {
            req.flash('error_msg', 'Credenciales inválidas');
            return res.redirect('/login');
        }

        const tokenPayload = {
            _id: dojo._id,
            role: dojo.activo ? 'dojo' : 'pending'
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.SECRET || 'endogeno',
            { expiresIn: '8h' }
        );

        res.cookie('authorization', token, {
            httpOnly: true,
            signed: true,
            maxAge: 8 * 60 * 60 * 1000
        });

        res.redirect(dojo.activo ? '/dojo/dashboard' : '/pending');

    } catch (error) {
        req.flash('error_msg', 'Error en el servidor');
        res.redirect('/login');
    }
});

// Registro de Dojo
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.DojoPassword, 10);
        const newDojo = new Dojo({
            ...req.body,
            DojoPassword: hashedPassword
        });

        await newDojo.save();
        req.flash('success_msg', 'Registro exitoso. Espere validación');
        res.redirect('/');

    } catch (error) {
        if (error.code === 11000) {
            req.flash('error_msg', 'El correo ya está registrado');
        } else {
            req.flash('error_msg', 'Error en el registro');
        }
        res.redirect('/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('authorization');
    req.flash('success_msg', 'Sesión cerrada exitosamente');
    res.redirect('/');
});

module.exports = router;