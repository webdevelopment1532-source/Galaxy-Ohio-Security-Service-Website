// Shared JWT authentication module for Galaxy Guard Ohio
import jwt from 'jsonwebtoken';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET: string = getRequiredEnv('JWT_SECRET');

export function generateToken(payload: object, expiresIn: string = '1h') {
  // Use the correct options type for jwt.sign
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string) {
  if (!token) throw new Error('Token is required');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error('JWT verification failed:', err);
    throw err;
  }
}
