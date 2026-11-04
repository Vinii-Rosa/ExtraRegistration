import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string) {
  return hash(password, 10);
}
export async function comparePassword(password: string, hashValue: string) {
  return compare(password, hashValue);
}
