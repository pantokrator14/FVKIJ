//Aquí van los modelos de los dojos. Aquí se incluye tambien la encriptacion de contraseña
const mongoose = require('mongoose'); //Solicitamos las dependencias
const { Schema } = mongoose; //Y de ella tomamos el modelo de esquemas
const bcrypt = require('bcryptjs');

//Definimos el modelo...
const dojoSchema = new Schema({
    DojoName : { type : String, require : true},
    DojoRIF : { type : String, require : true}, //Registro I Fiscal 
    DojoFoundation : { type : Date, require : true},
    solvente : { type : Boolean, default : false},  //Solvencia con la federeación
    activo : { type : Boolean, default : false}, //activo para acceder al sistema
    DojoEmail : { type : String, required : false},
    DojoPassword : { type : String, require : true},
    DojoAddress : {type : String, require : true},   //Calle, ciudad, estado
    artes : [{ type : String, require : true}],
    FounderName : String,
    FounderID : Number,
    FounderEmail : String,
    grados : String,
    ingresoAlSistema : {type : Date, default : Date.now},
    permisos : {type : String, default : 'dojo'}, //Para identificar sus funciones, complemento a la autenticacion especificamente para los dojos
});

//Pasamos a encriptar la contraseña usando procesos asincronos que tomaran la contraseña y haran el hash
dojoSchema.methods.encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10); //Generador para el hash
    const hash = await bcrypt.hash(contrasena, salt); //Se realiza un hash donde se usaran la contraseña y el generador 
    return hash; //Retorna la clave ya encriptada
};

//Comparacion de contraseñas, usamos igual una funcion asincrona que toma la contraseña como parametro
dojoSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.DojoPassword); //Compara la contraseña con la guardada en base de datos
};

//Finalmente exportamos este modelo
module.exports = mongoose.model('Dojo', dojoSchema);