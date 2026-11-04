import type { FastifyInstance } from 'fastify';
import ExtraHoursController from '../controllers/extra_hours/index.js';
import { authenticate } from '../middleware/auth.js';

export default async function ExtraHoursRoutes(fastify: FastifyInstance) {
  fastify.post('/extra-hour/create', { preHandler: authenticate }, ExtraHoursController.createExtraHour);
  fastify.get('/extra-hours', { preHandler: authenticate }, ExtraHoursController.getExtraHours);
  fastify.get('/extra-hour/:extra_hour_id', { preHandler: authenticate }, ExtraHoursController.getExtraHour);
  fastify.put('/update-extra-hour/:extra_hour_id', { preHandler: authenticate }, ExtraHoursController.updateExtraHour);
  fastify.delete('/delete-extra-hour/:extra_hour_id', { preHandler: authenticate }, ExtraHoursController.deleteExtraHour);
}
