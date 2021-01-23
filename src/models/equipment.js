//Aquí está el modelo para las asignaciones de equipos. Estas son registradas a criterio de la federacion y pueden asignar un responsable
const mongoose = require('mongoose'); //Solicitamos mongoose
const { Schema } = mongoose; //Modelo

//Definimos:
const equipmentSchema = new Schema({
    type: { type: String, required: true }, // shinai | bogu
    description : {type : String, required : true}, //Descripcion del equipo
    responsible : {type : mongoose.ObjectId}, // default FVK
    responsibleUser : {type : mongoose.ObjectId, required : true}, //Kenshi encargado de tal asignacion
    assignedDate : {
        type : Date,
        default : Date.now
    }
});

//Exportamos el modelo
module.exports = mongoose.model('Equipment', equipmentSchema);