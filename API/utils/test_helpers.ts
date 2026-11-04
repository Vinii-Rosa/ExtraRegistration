import { expect, jest } from '@jest/globals';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import Users from '../models/users.js';
import { hashPassword } from './hash.js';

const jwtApp = Fastify();
await jwtApp.register(jwt, { secret: 'test-secret' });

export const defaultUserData = {
  id: 'user-test-0001',
  name: 'Usuário Teste',
  email: 'usuario@teste.com',
  password: '123456',
};

export const defaultReq = { body: {}, params: {}, query: {} };

export const ensureDefaultData = async () => {
  const [user] = await Users.findOrCreate({
    where: { id: defaultUserData.id },
    defaults: {
      ...defaultUserData,
      password: await hashPassword(defaultUserData.password),
    },
  });
  return { user };
};

export const mockReply = () => {
  const reply: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    jwtSign: jest.fn(async (payload: any, options: any) => jwtApp.jwt.sign(payload, options)),
    setCookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return reply;
};

const buildReq = (overrides: Record<string, any> = {}, user?: Record<string, any>) => ({
  body: {},
  params: {},
  query: {},
  cookies: {},
  user,
  log: { error: jest.fn() },
  server: jwtApp,
  ...overrides,
});

export const loginUser = async (overrides: Record<string, any> = {}) => {
  const { user } = await ensureDefaultData();
  const loggedUser = { user_id: user.id, email: user.email };
  const req = buildReq({ ...defaultReq, ...overrides }, loggedUser);
  return { req, user, loggedUser };
};

export const callAssertSuccess = async (fn: (req: any, res: any) => Promise<any>, reqOverrides: Record<string, any> = {}, status?: number) => {
  const { req } = await loginUser(reqOverrides);
  const res = mockReply();
  await fn(req, res);

  const code = res.status.mock.calls[0]?.[0];
  expect(code).toBeGreaterThanOrEqual(200);
  expect(code).toBeLessThan(300);
  if (status) expect(code).toBe(status);
  return res.send.mock.calls[0]?.[0];
};

export const callAssertError = async (fn: (req: any, res: any) => Promise<any>, reqOverrides: Record<string, any> = {}, message?: string) => {
  const { req } = await loginUser(reqOverrides);
  const res = mockReply();
  await fn(req, res);

  const code = res.status.mock.calls[0]?.[0];
  expect(code).toBeGreaterThanOrEqual(400);
  const body = res.send.mock.calls[0]?.[0];
  if (message) expect(body.message).toBe(message);
  return body;
};
