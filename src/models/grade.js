//Aquí va el modelo de documento para los grados de los kenshins
const mongoose = require('mongoose'); //Requerimos la dependencia mongoose
const { Schema } = mongoose; //Y la utilizamos para crear un objeto llamado schema que servirá para modelar nuestros datos

//Aquí se crea el modelado, cada elemento tiene un tipo de dato que va a recibir y si es necesario o no.
const GradeSchema = new Schema({
    name: {type : String, required : true},
    rank: {type : Number, required : true}
});

module.exports = mongoose.model('Grades', GradeSchema); //Finalmente exportamos para su uso.