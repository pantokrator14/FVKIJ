//Aquí está el modelo para los administradores. Sólo habrán tres administradores registrados (presidente, secretario y tesorero).
const mongoose = require('mongoose'); //Solicitamos mongoose
const { Schema } = mongoose; //Modelo
const bcrypt = require('bcryptjs'); //Para el

//Definimos:
const adminSchema = new Schema({
    cargo : {type : String, required: true}, //nombre del cargo
    password : {type: String, required : true}, //Contraseña de acceso
    correo : {type: String, required : true}, //correo del cargo
    permisos : {type : String, required : true, default : 'presidente', enum : ['presidente', 'secretario', 'tesorero']}, //Para definir las acciones de cada uno.
});

//Encriptacion
adminSchema.methods.encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);
    return hash;
};

//Comparacion de contraseñas
adminSchema.methods.matchPassword = async function (contrasena) {
    return await bcrypt.compare(contrasena, this.password);
};

//Exportamos el modelo
module.exports = mongoose.model('Admin', adminSchema);