const Handlebars = require('handlebars');

Handlebars.registerHelper('eq', function(a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('hasPermission', function(permission, options) {
  return this.permissions[permission] 
    ? options.fn(this) 
    : options.inverse(this);
});