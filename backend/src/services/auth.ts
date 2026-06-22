import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export function signSession(username: string): string {
  return jwt.sign({ sub: username, role: 'admin' }, env.JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifySession(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
  } catch {
    return null;
  }
}

export function verifyPassword(plain: string): boolean {
  return bcrypt.compareSync(plain, env.ADMIN_PASSWORD_HASH);
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}
