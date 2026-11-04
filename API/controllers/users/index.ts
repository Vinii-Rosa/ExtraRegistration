import type { Transaction } from 'sequelize';
import type { FastifyReply, FastifyRequest } from 'fastify';
import db from '../../db.js';
import Users from '../../models/users.js';
import { hashPassword } from '../../utils/hash.js';

type CreateUserBody = { name?: string; email?: string; password?: string };

const UsersController = {
  createUser: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { name, email, password } = req.body as CreateUserBody;

      if (!name) {
        return res.status(400).send({ message: 'Nome não informado' });
      }
      if (!email) {
        return res.status(400).send({ message: 'Email não informado' });
      }
      if (!password) {
        return res.status(400).send({ message: 'Senha não informada' });
      }

      const emailInUse = await Users.findOne({
        where: { email },
        attributes: ['email'],
      });

      if (emailInUse) {
        return res.status(400).send({ message: 'Email já em uso' });
      }

      transaction = await db.transaction();

      await Users.create({
        name,
        email,
        password: await hashPassword(password),
      }, { transaction });

      await transaction.commit();
      return res.status(201).send({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao criar usuário');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao criar usuário', error: (error as Error).message });
    }
  },
};

export default UsersController;
