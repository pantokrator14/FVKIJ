// helpers/auth.js
const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
    const token = req.signedCookies.authorization;
    if (!token) return res.redirect('/');

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('authorization').redirect('/');
    }
};

exports.checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) return res.redirect('/login');
        
        const hasAccess = requiredPermissions.every(perm => 
            req.user.permissions && req.user.permissions[perm]
        );

        if (!hasAccess) {
            req.flash('error_msg', 'Acceso no autorizado');
            
            // Redirección basada en el rol del usuario
            switch(req.user.role) {
                case 'admin':
                    return res.redirect('/FVK/dashboard');
                case 'dojo':
                    return res.redirect('/dojo/dashboard');
                case 'student':
                    return res.redirect('/student/dashboard');
                default:
                    return res.redirect('/login');
            }
        }
        next();
    };
};