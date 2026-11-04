import moment from 'moment';
import { Op } from 'sequelize';
import type { Transaction } from 'sequelize';
import ExtraHours from '../models/extra_hours.js';
import Projects from '../models/projects.js';
import MonthlyTotals from '../models/monthly_totals.js';

export async function syncTotals(user_id: string, project_ids: string | string[], months: string | string[], transaction: Transaction) {
  for (const project_id of new Set([project_ids].flat())) {
    const total = (await ExtraHours.sum('total_value', { where: { user_id, project_id }, transaction })) || 0;
    await Projects.update({ total_profit: total }, { where: { id: project_id, user_id }, transaction });
  }

  for (const month of new Set([months].flat())) {
    const start = moment(month, 'YYYY-MM', true).startOf('month').format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM', true).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    const total = (await ExtraHours.sum('total_value', {
      where: { user_id, date: { [Op.gte]: start, [Op.lt]: end } },
      transaction,
    })) || 0;

    const monthly = await MonthlyTotals.findOne({ where: { user_id, month }, attributes: ['id'], transaction });
    if (monthly) {
      await MonthlyTotals.update({ total }, { where: { id: monthly.get('id') as string }, transaction });
    } else {
      await MonthlyTotals.create({ user_id, month, total }, { transaction });
    }
  }
}
