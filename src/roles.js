//Acá se controlan los roles de acceso por parte de cada usuario
const accesscontrol = require("accesscontrol"); //Solicitamos la dependencia necesaria

const ac = new accesscontrol(); //creamos la instancia en la que te estableceran los roles

exports.roles = (function(){
    ac.grant('secretario')
        
})();