module.exports = (req, res, next) => {
  res.locals.isAdmin = req.user?.role === 'admin';
  res.locals.isDojo = req.user?.role === 'dojo';
  res.locals.isStudent = req.user?.role === 'student';
  res.locals.currentUser = req.user;
  next();
};