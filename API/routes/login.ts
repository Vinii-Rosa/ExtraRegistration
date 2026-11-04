import type { FastifyInstance } from 'fastify';
import LoginController from '../controllers/login/index.js';

export default async function LoginRoutes(fastify: FastifyInstance) {
  fastify.post('/login', LoginController.login);
  fastify.post('/refresh', LoginController.refresh);
  fastify.post('/logout', LoginController.logout);
}
