import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

let mongoConnected = false;

export async function connectMongo() {
  if (!MONGODB_URI) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    mongoConnected = true;
    console.log('MongoDB connected.');
  } catch (err) {
    console.warn('MongoDB connection failed:', err.message);
    console.warn('Continuing with in-memory mode.');
  }
}

export function isMongoConnected() {
  return mongoConnected;
}
