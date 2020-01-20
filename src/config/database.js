//Aquí va la conexión a la base de datos
//Primero importamos la dependencia mongoose
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false); //Por averiguar...
mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://user:user@fvk-h6afq.mongodb.net/test?retryWrites=true&w=majority', {
    useCreateIndex: true, //Averiguar esto también...
    useNewUrlParser: true,
    useUnifiedTopology: true
}) //Conectamos, el newparser es para que no de error al conectar
    .then(db => console.log('Base de datos conectada')) //Si corre, escribir en la consola el mensaje
    .catch(err => console.log(err)) //Si no, muestra en consola el error ocurrido.