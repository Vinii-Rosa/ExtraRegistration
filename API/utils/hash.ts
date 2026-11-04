import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string) => hash(password, 10);
export const comparePassword = async (password: string, hashValue: string) => compare(password, hashValue);
