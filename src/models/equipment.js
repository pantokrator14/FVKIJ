//Aquí está el modelo para las asignaciones de equipos. Estas son registradas a criterio de la federacion y pueden asignar un responsable
const mongoose = require('mongoose'); //Solicitamos mongoose
const { Schema } = mongoose; //Modelo

//Definimos:
const equipmentSchema = new mongoose.Schema({
  equipment: { type: String, required: true },
  kenshin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateAssigned: { type: Date, default: Date.now },
  status: { type: String, enum: ['activa', 'devuelta'], default: 'activa' }
});

//Exportamos el modelo
module.exports = mongoose.model('Equipment', equipmentSchema);