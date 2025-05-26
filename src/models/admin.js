const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin'], default: 'admin' },
  adminType: { 
    type: String, 
    enum: ['presidente', 'secretario', 'tesorero'],
    required: true
  },
  permissions: {
    finanzas: { type: Boolean, default: false },
    administrativo: { type: Boolean, default: false }
  }
});

// Asignar permisos automáticamente según el tipo de admin
AdminSchema.pre('save', function(next) {
  switch(this.adminType) {
    case 'secretario':
      this.permissions = { administrativo: true};
      break;
    case 'tesorero':
      this.permissions = { finanzas: true };
      break;
    case 'presidente':
      this.permissions = { finanzas: true, administrativo: true };
      break;
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);