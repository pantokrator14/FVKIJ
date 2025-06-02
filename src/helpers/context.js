module.exports = (req, res, next) => {
  res.locals.isFederationAdmin = ['presidente', 'secretario', 'tesorero'].includes(req.user?.role);
  res.locals.isDojoAdmin = req.user?.role === 'dojo_admin';
  res.locals.isKenshin = req.user?.role === 'kenshin';
  res.locals.currentUser = req.user;
  next();
};