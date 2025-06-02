const Handlebars = require('handlebars');

Handlebars.registerHelper('includes', function(array, value, options) {
  return array.includes(value) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('hasRole', function(role, options) {
  return this.role === role ? options.fn(this) : options.inverse(this);
});