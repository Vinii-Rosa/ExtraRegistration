import { describe, expect, test } from '@jest/globals';
import { callAssertError, callAssertSuccess, defaultReq, defaultUserData, loginUser, mockReply } from '../../utils/test_helpers.js';
import LoginController from '../../controllers/login/index.js';

const tokenUser = { user_id: defaultUserData.id, email: defaultUserData.email };

describe('LoginController', () => {
  test('Login com credenciais corretas retorna token e define o cookie de refresh', async () => {
    const { req } = await loginUser({
      body: { email: defaultUserData.email, password: defaultUserData.password },
    });
    const res = mockReply();

    await LoginController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const { token } = res.send.mock.calls[0][0];
    expect(req.server.jwt.decode(token)).toMatchObject(tokenUser);
    expect(res.setCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 }),
    );
  });

  test('Erro no login com senha errada', async () => {
    await callAssertError(LoginController.login, {
      ...defaultReq,
      body: { email: defaultUserData.email, password: 'errada' },
    }, 'Email ou senha inválidos');
  });

  test('Erro no login com email inexistente', async () => {
    await callAssertError(LoginController.login, {
      ...defaultReq,
      body: { email: 'naoexiste@teste.com', password: '123456' },
    }, 'Email ou senha inválidos');
  });

  test('Erro no login sem email', async () => {
    await callAssertError(LoginController.login, {
      ...defaultReq,
      body: { password: '123456' },
    }, 'Email não informado');
  });

  test('Erro no login sem senha', async () => {
    await callAssertError(LoginController.login, {
      ...defaultReq,
      body: { email: defaultUserData.email },
    }, 'Senha não informada');
  });

  test('Refresh com cookie válido retorna novo token', async () => {
    const refreshToken = await mockReply().jwtSign({ ...tokenUser, type: 'refresh' }, { expiresIn: '7d' });

    const body = await callAssertSuccess(LoginController.refresh, {
      ...defaultReq,
      cookies: { refresh_token: refreshToken },
    }, 200);
    expect(body.token).toEqual(expect.any(String));
  });

  test('Erro no refresh sem cookie', async () => {
    await callAssertError(LoginController.refresh, { ...defaultReq }, 'Refresh token não informado');
  });

  test('Erro no refresh com access token no lugar do refresh', async () => {
    const accessToken = await mockReply().jwtSign(tokenUser, { expiresIn: '15m' });

    await callAssertError(LoginController.refresh, {
      ...defaultReq,
      cookies: { refresh_token: accessToken },
    }, 'Refresh token inválido');
  });

  test('Erro no refresh com token inválido', async () => {
    await callAssertError(LoginController.refresh, {
      ...defaultReq,
      cookies: { refresh_token: 'lixo' },
    }, 'Refresh token inválido');
  });

  test('Logout limpa o cookie de refresh', async () => {
    const { req } = await loginUser();
    const res = mockReply();

    await LoginController.logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
