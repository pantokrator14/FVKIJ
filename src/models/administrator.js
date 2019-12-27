//Aquí está el modelo para los administradores. Sólo habrán tres administradores registrados (presidente, secretario y tesorero).
const mongoose = require('mongoose'); //Solicitamos mongoose
const { Schema } = mongoose; //Modelo
const bcrypt = require('bcryptjs'); //Para el

//Definimos:
const adminSchema = new Schema({
    nombreCargo : {type : String, required: true}, //nombre del cargo
    contraseña : {type: String, required : true}, //Contraseña de acceso
    //permisos : {type : String, required : true}, //Para definir las acciones de cada uno.
});

//Encriptacion
adminSchema.methods.encryptPassword = async (contraseña) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contraseña, salt);
    return hash;
};

//Comparacion de contraseñas
adminSchema.methods.matchPassword = async (contraseña) => {
    return await bcrypt.compare(contraseña, this.contraseña);
};

//Exportamos el modelo
module.exports = mongoose.model('Admin', adminSchema);