//Aquí va la conexión a la base de datos
//Primero importamos la dependencia mongoose
const mongoose = require('mongoose');
require('dotenv').config(); // Añadir para cargar variables de entorno

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.DATABASE_URL;
        if (!MONGODB_URI) {
            throw new Error("DATABASE_URL no definida en .env");
        }
        
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("❌ Error de conexión a MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;