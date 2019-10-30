//Aquí está el modelo para las asignaciones de equipos. Estas son registradas a criterio de la federacion y pueden asignar un responsable
const mongoose = require('mongoose'); //Solicitamos mongoose
const { Schema } = mongoose; //Modelo

//Definimos:
const asignacionSchema = new Schema({
    responsable : {type : String, default : 'FVK'}, //Kenshi encargado de tal asignacion
    descripcion : {type : String, required : true}, //Descripcion del equipo
    tipo : {type: String, required : true}, //Tipo de equipo, shinai o bogu
});

//Exportamos el modelo
module.exports = mongoose.model('Asignacion', asignacionSchema);