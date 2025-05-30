//Aquí está el modelo para las asignaciones de equipos. Estas son registradas a criterio de la federacion y pueden asignar un responsable
const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['shinai', 'bokken', 'iaito', 'bogu', 'uniforme', 'otros']
  },
  description: { type: String, required: true },
  serialNumber: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['disponible', 'asignado', 'en_reparacion', 'baja'], 
    default: 'disponible'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  dateAssigned: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);