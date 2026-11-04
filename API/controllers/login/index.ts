import type { FastifyReply, FastifyRequest } from 'fastify';
import Users from '../../models/users.js';
import { comparePassword } from '../../utils/hash.js';
import { clearRefreshCookie, setRefreshCookie, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/authTokens.js';

type LoginBody = { email?: string; password?: string };

const LoginController = {
  login: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { email, password } = req.body as LoginBody;

      if (!email) {
        return res.status(400).send({ message: 'Email não informado' });
      }
      if (!password) {
        return res.status(400).send({ message: 'Senha não informada' });
      }

      const user = await Users.findOne({
        where: { email },
        attributes: ['id', 'email', 'password'],
      });

      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).send({ message: 'Email ou senha inválidos' });
      }

      const tokenUser = { user_id: user.id, email: user.email };
      const refreshToken = await signRefreshToken(res, tokenUser);
      const token = await signAccessToken(res, tokenUser);
      setRefreshCookie(res, refreshToken);

      return res.status(200).send({ token });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao fazer login');
      return res.status(500).send({ message: 'Erro ao fazer login', error: (error as Error).message });
    }
  },

  refresh: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).send({ message: 'Refresh token não informado' });
      }

      const payload = verifyRefreshToken(req, refreshToken);

      if (!payload) {
        return res.status(401).send({ message: 'Refresh token inválido' });
      }

      const user = await Users.findOne({
        where: { id: payload.user_id },
        attributes: ['id', 'email'],
      });

      if (!user) {
        return res.status(401).send({ message: 'Refresh token inválido' });
      }

      const tokenUser = { user_id: user.id, email: user.email };
      const newRefreshToken = await signRefreshToken(res, tokenUser);
      const token = await signAccessToken(res, tokenUser);
      setRefreshCookie(res, newRefreshToken);

      return res.status(200).send({ token });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao renovar token');
      return res.status(500).send({ message: 'Erro ao renovar token', error: (error as Error).message });
    }
  },

  logout: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      clearRefreshCookie(res);
      return res.status(200).send({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao fazer logout');
      return res.status(500).send({ message: 'Erro ao fazer logout', error: (error as Error).message });
    }
  },
};

export default LoginController;
