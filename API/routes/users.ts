import type { FastifyInstance } from 'fastify';
import UsersController from '../controllers/users/index.js';

export default async function UsersRoutes(fastify: FastifyInstance) {
  fastify.post('/user/create', UsersController.createUser);
}
