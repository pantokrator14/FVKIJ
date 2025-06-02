//Aquí van los modelos de usuarios individuales. Es tecnicamente lo mismo que los dojos
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: { type: String, required: true },
    identification: { type: String, required: true },
    birthdate: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
    type: String,
    required: true,
    enum: ['presidente', 'secretario', 'tesorero', 'dojo_admin', 'kenshin'],
    default: 'kenshin'
  },
    adminType: { 
      type: String, 
      enum: ['presidente', 'secretario', 'tesorero'] 
    },
    permissions: {
      finanzas: { type: Boolean, default: false },
      administrativo: { type: Boolean, default: false }
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
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Dojo'
    }
}, { timestamps: true });

// Encriptación simplificada
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre('save', function(next) {
  // Permisos para administradores de federación
  if (['presidente', 'secretario', 'tesorero'].includes(this.role)) {
    this.adminType = this.role;
    
    switch(this.role) {
      case 'secretario':
        this.permissions = { administrativo: true };
        break;
      case 'tesorero':
        this.permissions = { finanzas: true };
        break;
      case 'presidente':
        this.permissions = { finanzas: true, administrativo: true };
        break;
    }
}});

// Comparación de contraseñas
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};



// Verificación de solvencia
userSchema.methods.isSolvent = async function() {
  const payment = await Payment.findOne({
    status: 'confirmado',
    type: 'ingreso',
    to: this.dojo,
    from: this._id,
    date: { 
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      $lte: new Date()
    }
  });
  
  return !!payment;
};

module.exports = mongoose.model('User', userSchema);