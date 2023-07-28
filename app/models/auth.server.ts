import bcrypt from 'bcryptjs';

export function createPasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}

export function isValidPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}
