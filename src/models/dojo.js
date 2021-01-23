//Aquí van los modelos de los dojos. Aquí se incluye tambien la encriptacion de contraseña
const mongoose = require('mongoose'); //Solicitamos las dependencias
const { Schema } = mongoose; //Y de ella tomamos el modelo de esquemas
const Payment = require('./payment');

//Definimos el modelo...
const dojoSchema = new Schema({
    name : { type : String, required : true},
    rif : { type : String, required : true}, //Registro I Fiscal 
    foundationDate : { type : Date, required : true},
    active : { type : Boolean, default : false}, //activo para acceder al sistema
    founder: {
        _id: { type: mongoose.ObjectId },
        name: { type: String },
    },
    arts : [{ type : String, required : true}]
});

dojoSchema.methods.canEdit = function (user) {
    return Boolean(user.dojo.canEdit);
}

dojoSchema.methods.solvente = async function () {
    let today = new Date();
    today.setTime(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(1);
    if(today.getMonth === 0) { // si estamos en enero
        // el año pasado
        startDate.setFullYear(today.getFullYear() -1);
        // mes de diciembre
        startDate.setMonth(11);
    } else {
        startDate.setMonth(today.getMonth - 1);
    }

    const payment = await Payment.findOne({
        verified: true,
        assignedTo: {
            type: 'dojo',
            value: {
                _id: this._id
            }
        },
        solvingDate: {
            $gte: startDate,
            $lte: today 
        }
    })

    return !!payment;
}

//Finalmente exportamos este modelo
module.exports = mongoose.model('Dojo', dojoSchema);