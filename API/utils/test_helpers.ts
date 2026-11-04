import { expect, jest } from '@jest/globals';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import Users from '../models/users.js';
import { hashPassword } from './hash.js';
import ProjectsController from '../controllers/projects/index.js';

const jwtApp = Fastify();
await jwtApp.register(jwt, { secret: 'test-secret' });

export const defaultUserData = {
  id: 'user-test-0001',
  name: 'Usuário Teste',
  email: 'usuario@teste.com',
  password: '123456',
};

export const otherUserData = {
  id: 'user-test-0002',
  name: 'Outro Usuário',
  email: 'outro@teste.com',
  password: '123456',
};

export const defaultReq = { body: {}, params: {}, query: {} };

export async function ensureDefaultData() {
  const [user] = await Users.findOrCreate({
    where: { id: defaultUserData.id },
    defaults: {
      ...defaultUserData,
      password: await hashPassword(defaultUserData.password),
    },
  });
  return { user };
}

export async function ensureOtherData() {
  const [user] = await Users.findOrCreate({
    where: { id: otherUserData.id },
    defaults: {
      ...otherUserData,
      password: await hashPassword(otherUserData.password),
    },
  });
  return { user, loggedUser: { user_id: user.id, email: user.email } };
}

export function mockReply() {
  const reply: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    jwtSign: jest.fn(async (payload: any, options: any) => jwtApp.jwt.sign(payload, options)),
    setCookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return reply;
}

function buildReq(overrides: Record<string, any> = {}, user?: Record<string, any>) {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    user,
    log: { error: jest.fn() },
    server: jwtApp,
    ...overrides,
  };
}

export async function loginUser(overrides: Record<string, any> = {}) {
  const { user } = await ensureDefaultData();
  const loggedUser = { user_id: user.id, email: user.email };
  const req = buildReq({ ...defaultReq, ...overrides }, loggedUser);
  return { req, user, loggedUser };
}

export async function callAssertSuccess(fn: (req: any, res: any) => Promise<any>, reqOverrides: Record<string, any> = {}, status?: number) {
  const { req } = await loginUser(reqOverrides);
  const res = mockReply();
  await fn(req, res);

  const code = res.status.mock.calls[0]?.[0];
  expect(code).toBeGreaterThanOrEqual(200);
  expect(code).toBeLessThan(300);
  if (status) expect(code).toBe(status);
  return res.send.mock.calls[0]?.[0];
}

export async function callAssertError(fn: (req: any, res: any) => Promise<any>, reqOverrides: Record<string, any> = {}, message?: string) {
  const { req } = await loginUser(reqOverrides);
  const res = mockReply();
  await fn(req, res);

  const code = res.status.mock.calls[0]?.[0];
  expect(code).toBeGreaterThanOrEqual(400);
  const body = res.send.mock.calls[0]?.[0];
  if (message) expect(body.message).toBe(message);
  return body;
}

export async function createProject(project_name: string, hourly_value = 60, reqOverrides: Record<string, any> = {}) {
  await callAssertSuccess(ProjectsController.createProject, {
    ...defaultReq,
    ...reqOverrides,
    body: { project_name, hourly_value },
  }, 201);

  const { projects } = await callAssertSuccess(ProjectsController.getProjects, {
    ...defaultReq,
    ...reqOverrides,
    query: { project_name },
  }, 200);
  return projects.find((project: any) => project.project_name === project_name);
}
