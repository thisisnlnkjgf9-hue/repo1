import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    req.user = {
      userId: 'u1',
      name: 'Anonymous User',
      email: 'guest@nouryum.app'
    };
    return next();
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
