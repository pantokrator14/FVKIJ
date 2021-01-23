const { STATUS_CODES } = require('http');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
//Esto nos permite autenticar al usuario cada vez que este desee realizar una accion



// ES UN USUARIO VERIFICADO: INICIO SESION
exports.isAuthenticated = (req, res, next) => { //A la cual creamos un metodo
  let token = req.signedCookies.authorization;

  if(!token) {
    req.flash('error_msg', 'No token provided'); //Sino, error.
    return res.redirect('/');
  }
  
  /** id del usuario -> decoded: { _id: ObjectId } */
  const decoded = jwt.verify(token, req.app.get('secret'));

  User.findById(decoded._id)
  .then(user => {
    //no hay usuario
    if(!user) {
      req.flash('error_msg', 'User does not exist'); //Sino, error.
      return res.redirect('/');
    }

    // hay usuario
    user.accessPermissions = user.permissions();
    req.user = user;
    next();
  })
  // error de conexión
  .catch(err => {
    req.flash('error_msg', err.message); //Sino, error.
    return res.redirect('/');
  });

};

/** REQUERIMIENTO: ANTES DEBE PASAR POR isAuthenticated
 * router.use(isAuthenticated, isAdmin, adminRoute);
*/
exports.isAdmin = (req, res, next) => {
  const userPermissions = req.user.permissions();

  if(userPermissions.admin) {
    return next();
  }
  return res.statusCode(404).end(STATUS_CODES[404]);
}

/** REQUERIMIENTO: ANTES DEBE PASAR POR isAuthenticated
 * router.use(isAuthenticated, isDojo, dojoRoute);
*/
exports.isDojo = (req, res, next) => {
  const userPermissions = req.user.permissions();

  if(userPermissions.dojo) {
    return next();
  }
  return res.statusCode(401).end(STATUS_CODES[401]);
}