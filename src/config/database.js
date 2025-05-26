//Aquí va la conexión a la base de datos
//Primero importamos la dependencia mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://fvk_db:lHUbnmCusVyoqUsW@fvk.dh8lwzz.mongodb.net/?retryWrites=true&w=majority&appName=FVK';
        
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("❌ Error de conexión a MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;