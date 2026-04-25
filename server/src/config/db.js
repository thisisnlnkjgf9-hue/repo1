import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

let mongoConnected = false;
let reconnectTimer = null;
let listenersAttached = false;

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000
};

function scheduleReconnect() {
  if (reconnectTimer || !MONGODB_URI) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectMongo();
    } catch {
      // reconnect errors are already logged in connectMongo
    }
  }, 15000);
}

function attachConnectionListeners() {
  if (listenersAttached) return;

  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    mongoConnected = true;
    console.log('MongoDB connected.');
  });

  mongoose.connection.on('disconnected', () => {
    mongoConnected = false;
    console.warn('MongoDB disconnected. Retrying in 15s...');
    scheduleReconnect();
  });

  mongoose.connection.on('error', (err) => {
    mongoConnected = false;
    console.warn('MongoDB error:', err.message);
  });
}

export async function connectMongo() {
  if (!MONGODB_URI) {
    return;
  }

  attachConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, MONGO_OPTIONS);
    mongoConnected = true;
  } catch (err) {
    mongoConnected = false;
    console.warn('MongoDB connection failed:', err.message);
    console.warn('Retrying MongoDB connection in 15s.');
    scheduleReconnect();
  }
}

export function isMongoConnected() {
  return mongoConnected;
}
