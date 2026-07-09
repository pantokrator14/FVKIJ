const mongoose = require('mongoose');
const User = require('../models/admin');
const bcrypt = require('bcryptjs');

const createDefaultAdmins = async () => {
  try {
    const admins = [
      {
        email: 'presidente@fvk.com',
        password: 'PresidenteFVK123!',
        role: 'admin',
        adminType: 'presidente',
        permissions: {
          finanzas: true,
          administrativo: true
        }
      },
      {
        email: 'secretario@fvk.com',
        password: 'SecretarioFVK123!',
        role: 'admin',
        adminType: 'secretario',
        permissions: {
          finanzas: false,
          administrativo: true
        }
      },
      {
        email: 'tesorero@fvk.com',
        password: 'TesoreroFVK123!',
        role: 'admin',
        adminType: 'tesorero',
        permissions: {
          finanzas: true,
          administrartivo: false
        }
      }
    ];

    for (const admin of admins) {
      const existingAdmin = await Admin.findOne({ email: admin.email });
      
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        
        const newAdmin = new Admin({
          ...admin,
          password: hashedPassword,
          admin: true
        });
        
        await newAdmin.save();
        console.log(`✅ Admin creado: ${admin.name}`);
      }
    }
    
    console.log('🚀 Todos los administradores están listos');
  } catch (error) {
    console.error('❌ Error creando administradores:', error.message);
  }
};

module.exports = createDefaultAdmins;