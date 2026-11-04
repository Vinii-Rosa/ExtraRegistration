import type { FastifyInstance } from 'fastify';
import MonthlyTotalsController from '../controllers/monthly_totals/index.js';
import { authenticate } from '../middleware/auth.js';

export default async function MonthlyTotalsRoutes(fastify: FastifyInstance) {
  fastify.get('/monthly-totals', { preHandler: authenticate }, MonthlyTotalsController.getMonthlyTotals);
  fastify.get('/monthly-total/:month', { preHandler: authenticate }, MonthlyTotalsController.getMonthlyTotal);
}
