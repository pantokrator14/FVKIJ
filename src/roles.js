//Acá se controlan los roles de acceso por parte de cada usuario
const accesscontrol = require("accesscontrol");

const ac = new accesscontrol();

exports.roles = (function() {
    // Permisos base para todos los usuarios autenticados
    ac.grant('kenshin')
        .readOwn('user')
        .updateOwn('user')
        .readOwn('equipment')
        .readOwn('payment')
        .createOwn('payment');
    
    // Permisos para dojos
    ac.grant('dojo')
        .extend('kenshin')
        .readOwn('dojo')
        .updateOwn('dojo')
        .create('user')
        .readOwn('user')
        .updateOwn('user')
        .createOwn('payment')
        .readOwn('payment');
    
    // Secretario (gestión de dojos y equipos)
    ac.grant('secretario')
        .create('dojo')
        .readAny('dojo')
        .updateAny('dojo')
        .create('equipment')
        .readAny('equipment')
        .updateAny('equipment')
        .deleteAny('equipment');
    
    // Tesorero (gestión de pagos)
    ac.grant('tesorero')
        .readAny('payment')
        .updateAny('payment')
        .createAny('payment')
        .deleteAny('payment');
    
    // Presidente (todos los permisos)
    ac.grant('presidente')
        .extend('secretario')
        .extend('tesorero');
    
    return ac;
})();