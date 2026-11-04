import ExcelJS from 'exceljs';
import moment from 'moment';
import { Op } from 'sequelize';
import type { Transaction, WhereOptions } from 'sequelize';
import type { FastifyReply, FastifyRequest } from 'fastify';
import db from '../../db.js';
import ExtraHours from '../../models/extra_hours.js';
import MonthlyTotals from '../../models/monthly_totals.js';
import Projects from '../../models/projects.js';
import { calculateExtraValue } from '../../utils/calculate_extra_value.js';
import { syncTotals } from '../../utils/sync_totals.js';

type ExtraHourBody = {
  project_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string | null;
  card_name?: string | null;
  card_link?: string | null;
};
type ExtraHourParams = { extra_hour_id?: string };
type ExtraHourQuery = {
  page?: string;
  limit?: string;
  date?: string;
  month?: string;
  hour?: string;
  total_value?: string;
};
type ExportQuery = { month?: string };

const extraHourAttributes = [
  'id', 'project_id', 'date', 'card_name', 'card_link', 'start_time', 'end_time', 'total_value',
];

function isValidDate(date: unknown) {
  return typeof date === 'string' && moment(date, 'DD/MM/YYYY', true).isValid();
}
function isValidTime(time: unknown) {
  return typeof time === 'string' && moment(time, 'HH:mm', true).isValid();
}
function toDbDate(date: string) {
  return moment(date, 'DD/MM/YYYY', true).format('YYYY-MM-DD');
}
function toTime(time: string) {
  return time.slice(0, 5);
}
function toMonth(date: string) {
  return date.slice(0, 7);
}

const ExtraHoursController = {
  createExtraHour: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { project_id, date, start_time, end_time, card_name, card_link } = req.body as ExtraHourBody;

      if (!project_id) {
        return res.status(400).send({ message: 'Projeto não informado' });
      }
      if (!date) {
        return res.status(400).send({ message: 'Data não informada' });
      }
      if (!isValidDate(date)) {
        return res.status(400).send({ message: 'Data inválida' });
      }
      if (!start_time) {
        return res.status(400).send({ message: 'Hora de início não informada' });
      }
      if (!isValidTime(start_time)) {
        return res.status(400).send({ message: 'Hora de início inválida' });
      }
      if (end_time && !isValidTime(end_time)) {
        return res.status(400).send({ message: 'Hora de fim inválida' });
      }
      if (end_time && end_time === start_time) {
        return res.status(400).send({ message: 'Hora de fim igual à hora de início' });
      }

      const project = await Projects.findOne({
        where: { id: project_id, user_id },
        attributes: ['id', 'hourly_value'],
      });

      if (!project) {
        return res.status(404).send({ message: 'Projeto não encontrado' });
      }

      const dbDate = toDbDate(date);
      const total_value = end_time
        ? calculateExtraValue(start_time, end_time, project.get('hourly_value') as number)
        : null;

      transaction = await db.transaction();

      await ExtraHours.create({
        user_id,
        project_id,
        date: dbDate,
        start_time,
        end_time: end_time || null,
        card_name: card_name || null,
        card_link: card_link || null,
        total_value,
      }, { transaction });

      await syncTotals(user_id, project_id, toMonth(dbDate), transaction);

      await transaction.commit();
      return res.status(201).send({ message: 'Hora extra criada com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao criar hora extra');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao criar hora extra', error: (error as Error).message });
    }
  },

  getExtraHours: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const query = req.query as ExtraHourQuery;

      const page = query.page === undefined ? 1 : Number(query.page);
      const limit = query.limit === undefined ? 10 : Number(query.limit);

      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).send({ message: 'Página inválida' });
      }
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).send({ message: 'Limite inválido' });
      }

      const where: WhereOptions = { user_id };

      if (query.date !== undefined) {
        if (!isValidDate(query.date)) {
          return res.status(400).send({ message: 'Data inválida' });
        }
        where.date = toDbDate(query.date);
      }
      if (query.month !== undefined) {
        const month = moment(query.month, 'YYYY-MM', true);
        if (!month.isValid()) {
          return res.status(400).send({ message: 'Mês inválido' });
        }
        where.date = {
          [Op.gte]: month.clone().startOf('month').format('YYYY-MM-DD'),
          [Op.lt]: month.clone().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
        };
      }
      if (query.hour !== undefined) {
        const hour = Number(query.hour);
        if (query.hour === '' || !Number.isInteger(hour) || hour < 0 || hour > 23) {
          return res.status(400).send({ message: 'Hora inválida' });
        }
        const pad = String(hour).padStart(2, '0');
        where.start_time = { [Op.between]: [`${pad}:00:00`, `${pad}:59:59`] };
      }
      if (query.total_value !== undefined) {
        const total_value = Number(query.total_value);
        if (query.total_value === '' || !Number.isInteger(total_value)) {
          return res.status(400).send({ message: 'Valor inválido' });
        }
        where.total_value = total_value;
      }

      const { count, rows } = await ExtraHours.findAndCountAll({
        where,
        attributes: extraHourAttributes,
        order: [['date', 'DESC'], ['start_time', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      return res.status(200).send({
        extra_hours: rows,
        count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar horas extras');
      return res.status(500).send({ message: 'Erro ao buscar horas extras', error: (error as Error).message });
    }
  },

  getExtraHour: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const { extra_hour_id } = req.params as ExtraHourParams;

      const extra_hour = await ExtraHours.findOne({
        where: { id: extra_hour_id, user_id },
        attributes: extraHourAttributes,
      });

      if (!extra_hour) {
        return res.status(404).send({ message: 'Hora extra não encontrada' });
      }

      return res.status(200).send({ extra_hour });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar hora extra');
      return res.status(500).send({ message: 'Erro ao buscar hora extra', error: (error as Error).message });
    }
  },

  updateExtraHour: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { extra_hour_id } = req.params as ExtraHourParams;
      const { project_id, date, start_time, end_time, card_name, card_link } = req.body as ExtraHourBody;

      if (project_id !== undefined && !project_id) {
        return res.status(400).send({ message: 'Projeto não informado' });
      }
      if (date !== undefined && !isValidDate(date)) {
        return res.status(400).send({ message: 'Data inválida' });
      }
      if (start_time !== undefined && !isValidTime(start_time)) {
        return res.status(400).send({ message: 'Hora de início inválida' });
      }
      if (end_time && !isValidTime(end_time)) {
        return res.status(400).send({ message: 'Hora de fim inválida' });
      }

      const extra_hour = await ExtraHours.findOne({
        where: { id: extra_hour_id, user_id },
        attributes: ['id', 'project_id', 'date', 'start_time', 'end_time'],
      });

      if (!extra_hour) {
        return res.status(404).send({ message: 'Hora extra não encontrada' });
      }

      const oldProjectId = extra_hour.get('project_id') as string;
      const oldMonth = toMonth(extra_hour.get('date') as string);

      const newProjectId = project_id ?? oldProjectId;
      const newDate = date !== undefined ? toDbDate(date) : (extra_hour.get('date') as string);
      const newStart = start_time ?? toTime(extra_hour.get('start_time') as string);
      const currentEnd = extra_hour.get('end_time') as string | null;
      const newEnd = end_time !== undefined ? end_time : (currentEnd ? toTime(currentEnd) : null);

      if (newEnd && newEnd === newStart) {
        return res.status(400).send({ message: 'Hora de fim igual à hora de início' });
      }

      const project = await Projects.findOne({
        where: { id: newProjectId, user_id },
        attributes: ['id', 'hourly_value'],
      });

      if (!project) {
        return res.status(404).send({ message: 'Projeto não encontrado' });
      }

      const updateData: Record<string, unknown> = {
        project_id: newProjectId,
        date: newDate,
        start_time: newStart,
        end_time: newEnd || null,
        total_value: newEnd ? calculateExtraValue(newStart, newEnd, project.get('hourly_value') as number) : null,
      };
      if (card_name !== undefined) updateData.card_name = card_name || null;
      if (card_link !== undefined) updateData.card_link = card_link || null;

      transaction = await db.transaction();

      await ExtraHours.update(updateData, { where: { id: extra_hour_id, user_id }, transaction });

      await syncTotals(user_id, [oldProjectId, newProjectId], [oldMonth, toMonth(newDate)], transaction);

      await transaction.commit();
      return res.status(200).send({ message: 'Hora extra atualizada com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao atualizar hora extra');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao atualizar hora extra', error: (error as Error).message });
    }
  },

  deleteExtraHour: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { extra_hour_id } = req.params as ExtraHourParams;

      const extra_hour = await ExtraHours.findOne({
        where: { id: extra_hour_id, user_id },
        attributes: ['id', 'project_id', 'date'],
      });

      if (!extra_hour) {
        return res.status(404).send({ message: 'Hora extra não encontrada' });
      }

      transaction = await db.transaction();

      await ExtraHours.destroy({ where: { id: extra_hour_id, user_id }, transaction });

      await syncTotals(user_id, extra_hour.get('project_id') as string, toMonth(extra_hour.get('date') as string), transaction);

      await transaction.commit();
      return res.status(200).send({ message: 'Hora extra excluída com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao excluir hora extra');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao excluir hora extra', error: (error as Error).message });
    }
  },
  exportExtraHours: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const { month } = req.query as ExportQuery;

      if (!month) {
        return res.status(400).send({ message: 'Mês não informado' });
      }
      const monthMoment = moment(month, 'YYYY-MM', true);
      if (!monthMoment.isValid()) {
        return res.status(400).send({ message: 'Mês inválido' });
      }

      const extra_hours = await ExtraHours.findAll({
        where: {
          user_id,
          date: {
            [Op.gte]: monthMoment.clone().startOf('month').format('YYYY-MM-DD'),
            [Op.lt]: monthMoment.clone().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
          },
        },
        attributes: ['date', 'card_name', 'card_link', 'start_time', 'end_time', 'total_value'],
        order: [['date', 'ASC'], ['start_time', 'ASC']],
      });

      if (extra_hours.length === 0) {
        return res.status(404).send({ message: 'Nenhuma hora extra encontrada no mês' });
      }

      const monthly_total = await MonthlyTotals.findOne({
        where: { user_id, month },
        attributes: ['total'],
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Horas extras');
      sheet.columns = [
        { header: 'Data', key: 'date', width: 14, style: { numFmt: 'DD/MM/YYYY' } },
        { header: 'Nome do card', key: 'card_name', width: 30 },
        { header: 'Link do card', key: 'card_link', width: 40, style: { alignment: { horizontal: 'fill' } } },
        { header: 'Hora de início', key: 'start_time', width: 16 },
        { header: 'Hora de fim', key: 'end_time', width: 16 },
        { header: 'Valor', key: 'total_value', width: 14, style: { numFmt: '"R$" #,##0' } },
      ];
      sheet.getRow(1).font = { bold: true };

      for (const extra_hour of extra_hours) {
        const card_link = extra_hour.get('card_link') as string | null;
        const end_time = extra_hour.get('end_time') as string | null;
        sheet.addRow({
          date: moment.utc(extra_hour.get('date') as string, 'YYYY-MM-DD').toDate(),
          card_name: extra_hour.get('card_name') as string | null,
          card_link: card_link ? { text: card_link, hyperlink: card_link } : null,
          start_time: toTime(extra_hour.get('start_time') as string),
          end_time: end_time ? toTime(end_time) : null,
          total_value: extra_hour.get('total_value') as number | null,
        });
      }

      const totalRow = sheet.addRow({ date: 'Total do mês', total_value: monthly_total ? (monthly_total.get('total') as number) : 0 });
      totalRow.font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();

      return res
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="extras-${month}.xlsx"`)
        .status(200)
        .send(Buffer.from(buffer));
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao exportar horas extras');
      return res.status(500).send({ message: 'Erro ao exportar horas extras', error: (error as Error).message });
    }
  },
};

export default ExtraHoursController;
