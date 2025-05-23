const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verificar autenticación via JWT
exports.isAuthenticated = (req, res, next) => {
    const token = req.signedCookies.authorization;

    if (!token) {
        req.flash('error_msg', 'Debes iniciar sesión primero');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, req.app.get('secret'));
        User.findById(decoded._id)
            .then(user => {
                if (!user) {
                    req.flash('error_msg', 'Usuario no existe');
                    return res.clearCookie('authorization').redirect('/login');
                }
                req.user = user; // Adjunta el usuario a la solicitud
                next();
            })
            .catch(() => res.redirect('/login'));
    } catch (error) {
        res.clearCookie('authorization').redirect('/login');
    }
};

// Verificar si es Administrador
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') { // Asume que el modelo User tiene un campo 'role'
        req.flash('error_msg', 'Acceso no autorizado');
        return res.redirect('/');
    }
    next();
};

// Verificar si es Dojo
exports.isDojo = (req, res, next) => {
    if (req.user.role !== 'dojo') {
        req.flash('error_msg', 'Acceso no autorizado');
        return res.redirect('/');
    }
    next();
};