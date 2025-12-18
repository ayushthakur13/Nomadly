import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash?: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

// For hashing refresh tokens or other secrets
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function compareToken(token: string, hash?: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(token, hash);
}

export default { hashPassword, comparePassword, hashToken, compareToken };
