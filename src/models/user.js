//Aquí van los modelos de usuarios individuales. Es tecnicamente lo mismo que los dojos
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const Permission = require('./permission');
const Payment = require('./payment');

function generateSalt() {
    return bcrypt.genSaltSync(10);
}

//Modelo
const userSchema = new Schema({
    name : { type : String, required : true},
    identification : { type : Number, required : true},
    birthdate : { type : Date, required : true},
    email : {type : String, required : false, unique : true},
    password : { type : String, required : true },
    salt: { type: String, required: true },
    grade : {
        _id: { type: mongoose.ObjectId },
        name: { type: String },
        obtainedAt: { type: Date }
    },   //Grade
    gender : {type : String, required : true}, // mujer, hombre, otro
    height : {type : Number, required : true},
    weight : {type : Number, required : true},
    direccion : {type : String, required : true},
    dojo : {
        _id: { type: mongoose.ObjectId },
        name: { type: String },
        canEdit: { type: Boolean }
    }, // dojo
//    creacion : {type : Date, default : Date.now},
    admin : {type : Boolean, default : false}, //Para identificar sus funciones, complemento a la autenticacion especificamente para los usuarios
});



//Encriptacion
userSchema.methods.encryptPassword = async function (password) {
    this.salt = generateSalt();
    this.password = await bcrypt.hash(password, this.salt);
    await this.save();
    return this.password;
};

//Comparacion de contraseñas
userSchema.methods.matchPassword = async function (password) {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
};

userSchema.methods.permissions = function () {
    return new Permission(this);
}

userSchema.methods.solvente = async function () {
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
            type: 'user',
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




module.exports = mongoose.model('Users', userSchema);