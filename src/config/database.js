//Aquí va la conexión a la base de datos
//Primero importamos la dependencia mongoose
const mongoose = require('mongoose');


module.exports = function(cb) {

    const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://fvk_db:lHUbnmCusVyoqUsW@fvk.dh8lwzz.mongodb.net/?retryWrites=true&w=majority&appName=FVK';

    mongoose.connect(MONGODB_URI) // <-- Sin opciones obsoletas
    .then(db => {
        console.log("Connected to Database!");
        cb(null, db);
    })
    .catch(err => {
        console.error(err.message);
        cb(err);
    });
};