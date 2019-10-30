//Esto nos permite autenticar al usuario cada vez que este desee realizar una accion
const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'No esta autorizado.');
  res.redirect('/');
};

module.exports = helpers;