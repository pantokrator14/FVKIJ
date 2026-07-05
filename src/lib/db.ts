import mongoose from "mongoose";

const MONGODB_URI: string = process.env.DATABASE_URL ?? "";

if (!MONGODB_URI) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

/**
 * Conexión singleton a MongoDB usando Mongoose.
 * Reutiliza la conexión existente en desarrollo con hot-reload.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare const globalThis: {
  mongooseCache?: MongooseCache;
} & typeof global;

const cached: MongooseCache = globalThis.mongooseCache ?? { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
