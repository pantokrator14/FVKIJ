// helpers/auth.js
exports.isAuthenticated = (req, res, next) => {
  const token = req.signedCookies.authorization;
  
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('authorization').redirect('/login');
  }
};

exports.checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    
    const hasAccess = Object.keys(requiredPermissions).every(
      key => requiredPermissions[key] === userPermissions[key]
    );

    if (!hasAccess) {
      req.flash('error_msg', 'Acceso no autorizado');
      return res.redirect('/dashboard');
    }
    next();
  };
};