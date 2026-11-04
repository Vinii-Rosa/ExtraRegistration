import { afterAll, beforeAll } from '@jest/globals';
import db from '../db.js';
import '../models/index.js';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Os testes precisam rodar com NODE_ENV=test');
}

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});
