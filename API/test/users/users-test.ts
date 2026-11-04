import { describe, expect, test } from '@jest/globals';
import { callAssertError, callAssertSuccess, defaultReq } from '../../utils/test_helpers.js';
import UsersController from '../../controllers/users/index.js';
import Users from '../../models/users.js';

describe('UsersController', () => {
  test('Criando um usuário novo', async () => {
    const body = await callAssertSuccess(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'Novo Usuário', email: 'novo@teste.com', password: 'abc123' },
    }, 201);
    expect(body.message).toBe('Usuário criado com sucesso');

    const user = await Users.findOne({ where: { email: 'novo@teste.com' } });
    expect(user).not.toBeNull();
    expect(user!.name).toBe('Novo Usuário');
  });

  test('Senha é salva como hash', async () => {
    await callAssertSuccess(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'Hash', email: 'hash@teste.com', password: 'abc123' },
    });

    const user = await Users.findOne({ where: { email: 'hash@teste.com' } });
    expect(user!.password).not.toBe('abc123');
    expect(user!.password).toMatch(/^\$2[aby]\$/);
  });

  test('Erro ao criar usuário sem nome', async () => {
    await callAssertError(UsersController.createUser, {
      ...defaultReq,
      body: { email: 'a@teste.com', password: 'abc123' },
    }, 'Nome não informado');
  });

  test('Erro ao criar usuário sem email', async () => {
    await callAssertError(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'A', password: 'abc123' },
    }, 'Email não informado');
  });

  test('Erro ao criar usuário sem senha', async () => {
    await callAssertError(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'A', email: 'a@teste.com' },
    }, 'Senha não informada');
  });

  test('Erro ao criar usuário com email duplicado', async () => {
    await callAssertSuccess(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'A', email: 'dup@teste.com', password: 'abc123' },
    });

    await callAssertError(UsersController.createUser, {
      ...defaultReq,
      body: { name: 'B', email: 'dup@teste.com', password: 'abc123' },
    }, 'Email já em uso');
  });
});
