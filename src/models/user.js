//Aquí van los modelos de usuarios individuales. Es tecnicamente lo mismo que los dojos
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: { type: String, required: true },
    identification: { type: Number, required: true },
    birthdate: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['secretario', 'tesorero', 'presidente', 'dojo', 'kenshin'],
        default: 'kenshin'
    },
    grade: {
        _id: { type: mongoose.ObjectId },
        name: { type: String },
        obtainedAt: { type: Date }
    },
    gender: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    direccion: { type: String, required: true },
    dojo: {
        _id: { type: mongoose.ObjectId, ref: 'Dojo' },
        name: { type: String }
    }
}, { timestamps: true });

// Encriptación simplificada
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Comparación de contraseñas
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Verificación de solvencia (corregida)
userSchema.methods.solvente = async function() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const payment = await this.model('Payment').findOne({
        user: this._id,
        verified: true,
        createdAt: { $gte: firstDayOfMonth, $lte: today }
    });
    
    return !!payment;
};

module.exports = mongoose.model('User', userSchema);