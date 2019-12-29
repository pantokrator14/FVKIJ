//Esto nos permite autenticar al usuario cada vez que este desee realizar una accion
const helpers = {}; //Creamos una variable llamada helpers

helpers.isAuthenticated = (req, res, next) => { //A la cual creamos un metodo
  if (req.isAuthenticated()) { //Si el usuario está autenticado (funcion de passport)
    return next(); //Pasa
  }
  req.flash('error_msg', 'No esta autenticado.'); //Sino, error.
  res.redirect('/'); //Y regresa a la pantalla de login
};
//Finalmente exportamos esto para ser usado en otros archivos.
module.exports = helpers;