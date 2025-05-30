const Handlebars = require('handlebars');

Handlebars.registerHelper('includes', function(array, value, options) {
  return array.includes(value) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('hasPermission', function(permission, options) {
  return this.permissions[permission] 
    ? options.fn(this) 
    : options.inverse(this);
});