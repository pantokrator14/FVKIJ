//Aquí va el modelo de documento para los pagos tanto de dojos para la federacion como de los kenshins al dojo
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  type: { type: String, enum: ['ingreso', 'egreso'], required: true },
  amount: { type: Number, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pendiente', 'confirmado', 'cancelado'], 
    default: 'pendiente' 
  },
  from: { type: mongoose.Schema.Types.ObjectId, refPath: 'fromModel' },
  fromModel: { type: String, enum: ['User', 'Dojo'] },
  to: { type: mongoose.Schema.Types.ObjectId, refPath: 'toModel' },
  toModel: { type: String, enum: ['User', 'Dojo', 'FVK'] },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema); //Finalmente exportamos para su uso.