import type { FastifyInstance } from 'fastify';
import ProjectsController from '../controllers/projects/index.js';
import { authenticate } from '../middleware/auth.js';

export default async function ProjectsRoutes(fastify: FastifyInstance) {
  fastify.post('/project/create', { preHandler: authenticate }, ProjectsController.createProject);
  fastify.get('/projects', { preHandler: authenticate }, ProjectsController.getProjects);
  fastify.get('/project/:project_id', { preHandler: authenticate }, ProjectsController.getProject);
  fastify.put('/update-project/:project_id', { preHandler: authenticate }, ProjectsController.updateProject);
  fastify.delete('/delete-project/:project_id', { preHandler: authenticate }, ProjectsController.deleteProject);
  fastify.post('/recalculate-extra-hours/:project_id', { preHandler: authenticate }, ProjectsController.recalculateExtraHours);
}
