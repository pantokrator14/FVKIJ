//Aquí va la conexión a la base de datos
//Primero importamos la dependencia mongoose
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false); //Por averiguar...

module.exports = function(cb) {

    mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://user:user@fvk-h6afq.mongodb.net/test?retryWrites=true&w=majority', {
        useCreateIndex: true, //Averiguar esto también...
        useNewUrlParser: true,
        useUnifiedTopology: true
    }) //Conectamos, el newparser y unifiedTopology es para que no de error al conectar
    .then(db => {
        console.log("Connected to Database!");
        cb(null, db); // returns db in callback
    })
    .catch(err => {
        console.error(err.message) //Si no, muestra en consola el error ocurrido.
        cb(err);
    });
}