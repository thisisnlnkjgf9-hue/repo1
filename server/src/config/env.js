import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const JWT_SECRET = process.env.JWT_SECRET || 'nouryum-dev-secret-change-in-prod';
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin123';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'N0UR@umkLO9976';
