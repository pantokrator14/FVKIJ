//Aquí va el modelo de documento para los pagos tanto de dojos para la federacion como de los kenshins al dojo
const mongoose = require('mongoose'); //Requerimos la dependencia mongoose
const { Schema } = mongoose; //Y la utilizamos para crear un objeto llamado schema que servirá para modelar nuestros datos

//Aquí se crea el modelado, cada elemento tiene un tipo de dato que va a recibir y si es necesario o no.
const PaymentSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: { type: String, required: true },
        value: {
            _id: { type: mongoose.ObjectId, required: true }
        }
    },
    emited: {
        _id: { type: mongoose.ObjectId, required: true }
    },
    destiny: String,
    amount: {
        type : Number,
        required : true
    },
    solvingDate: { type: Date, required: true },
    verified: { type: Boolean, default: false }
});


module.exports = mongoose.model('Payment', PaymentSchema); //Finalmente exportamos para su uso.