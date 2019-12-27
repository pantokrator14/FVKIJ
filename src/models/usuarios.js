//Aquí van los modelos de usuarios individuales. Es tecnicamente lo mismo que los dojos
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

//Modelo
const userSchema = new Schema({
    nombre : { type : String, required : true},
    cedula : { type : Number, required : true},
    fechaNacimiento : { type : Date, required : true},
    solvente : { type : Boolean, default : true},  //Solvencia con la federación o con el dojo, por definir
    email : {type : String, required : false},
    contraseña : { type : String, required : true},
    grado : {type : String, required : true},   //1er Dan, 5to Kyu, etc.
    genero : {type : String, required : true},
    tamaño : {type : Number, required : true},
    peso : {type : Number, required : true},
    direccion : {type : String, required : true},
    dojoID : {type : String, required : true},
    creacion : {type : Date, default : Date.now},
    permisos : {type : String, default : 'usuario'}, //Para identificar sus funciones, complemento a la autenticacion especificamente para los usuarios
});

//Encriptacion
userSchema.methods.encryptPassword = async (contraseña) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contraseña, salt);
    return hash;
};

//Comparacion de contraseñas
userSchema.methods.matchPassword = async (contraseña) => {
    return await bcrypt.compare(contraseña, this.contraseña);
};

module.exports = mongoose.model('usuario', userSchema);