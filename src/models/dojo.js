//Aquí van los modelos de los dojos. Aquí se incluye tambien la encriptacion de contraseña
const mongoose = require('mongoose'); //Solicitamos las dependencias
const { Schema } = mongoose; //Y de ella tomamos el modelo de esquemas
const Payment = require('./payment');

//Definimos el modelo...
const dojoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rif: { type: String, required: true, unique: true },
  foundationDate: { type: Date, required: true },
  arts: [{ type: String, required: true }],
  email: { type: String, required: true },
  address: String,
  phone: String,
  // Referencia al usuario administrador del dojo
  adminUser: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User',
  required: true 
  }
}, { timestamps: true });

// Verificar si el dojo está solvente
dojoSchema.methods.isSolvent = async function() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const payment = await Payment.findOne({
    status: 'confirmado',
    $or: [
      { 
        toModel: 'Dojo',
        to: this._id,
        type: 'ingreso'
      },
      {
        fromModel: 'Dojo',
        from: this._id,
        type: 'egreso',
        'externalEntity': 'FVK' // Solo pagos a la federación
      }
    ],
    date: { $gte: firstDayOfMonth, $lte: today }
  });

  return !!payment;
};

module.exports = mongoose.model('Dojo', dojoSchema);