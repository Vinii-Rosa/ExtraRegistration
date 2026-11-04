import moment from 'moment';
import type { FastifyReply, FastifyRequest } from 'fastify';
import MonthlyTotals from '../../models/monthly_totals.js';

type MonthlyTotalParams = { month?: string };

const MonthlyTotalsController = {
  getMonthlyTotals: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;

      const monthly_totals = await MonthlyTotals.findAll({
        where: { user_id },
        attributes: ['month', 'total'],
        order: [['month', 'DESC']],
      });

      return res.status(200).send({ monthly_totals });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar somas mensais');
      return res.status(500).send({ message: 'Erro ao buscar somas mensais', error: (error as Error).message });
    }
  },

  getMonthlyTotal: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const { month } = req.params as MonthlyTotalParams;

      if (!month || !moment(month, 'YYYY-MM', true).isValid()) {
        return res.status(400).send({ message: 'Mês inválido' });
      }

      const monthly_total = await MonthlyTotals.findOne({
        where: { user_id, month },
        attributes: ['month', 'total'],
      });

      return res.status(200).send({ monthly_total: monthly_total ?? { month, total: 0 } });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar soma mensal');
      return res.status(500).send({ message: 'Erro ao buscar soma mensal', error: (error as Error).message });
    }
  },
};

export default MonthlyTotalsController;
