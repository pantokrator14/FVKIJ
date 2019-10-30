//Aquí va el modelo de documento para los pagos tanto de dojos para la federacion como de los kenshins al dojo
const mongoose = require('mongoose'); //Requerimos la dependencia mongoose
const { Schema } = mongoose; //Y la utilizamos para crear un objeto llamado schema que servirá para modelar nuestros datos

//Aquí se crea el modelado, cada elemento tiene un tipo de dato que va a recibir y si es necesario o no.
const PagoSchema = new Schema({
    emisor: String,
    destinatario: String,
    cantidad: {
        type : Number,
        required : true
    },
    fechaDeRealizacion: {
        type : Date,
        default: Date.now
    },
    descripcion: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Pago', PagoSchema); //Finalmente exportamos para su uso.