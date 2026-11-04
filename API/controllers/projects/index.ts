import { Op } from 'sequelize';
import type { Transaction, WhereOptions } from 'sequelize';
import type { FastifyReply, FastifyRequest } from 'fastify';
import db from '../../db.js';
import Projects from '../../models/projects.js';
import ExtraHours from '../../models/extra_hours.js';

type ProjectBody = { project_name?: string; hourly_value?: number };
type ProjectParams = { project_id?: string };
type ProjectQuery = { project_name?: string; hourly_value?: string; created_at?: string };

const projectAttributes = ['id', 'project_name', 'hourly_value', 'total_profit', 'createdAt'];

function isValidHourlyValue(value: unknown) {
  return Number.isInteger(value) && (value as number) > 0;
}

const ProjectsController = {
  createProject: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { project_name, hourly_value } = req.body as ProjectBody;

      if (!project_name) {
        return res.status(400).send({ message: 'Nome do projeto não informado' });
      }
      if (hourly_value === undefined || hourly_value === null) {
        return res.status(400).send({ message: 'Valor por hora não informado' });
      }
      if (!isValidHourlyValue(hourly_value)) {
        return res.status(400).send({ message: 'Valor por hora inválido' });
      }

      const nameInUse = await Projects.findOne({
        where: { user_id, project_name },
        attributes: ['id'],
      });

      if (nameInUse) {
        return res.status(400).send({ message: 'Nome do projeto já em uso' });
      }

      transaction = await db.transaction();

      await Projects.create({ user_id, project_name, hourly_value }, { transaction });

      await transaction.commit();
      return res.status(201).send({ message: 'Projeto criado com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao criar projeto');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao criar projeto', error: (error as Error).message });
    }
  },

  getProjects: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const { project_name, hourly_value, created_at } = req.query as ProjectQuery;

      const where: WhereOptions = { user_id };

      if (project_name) {
        where.project_name = { [Op.like]: `%${project_name}%` };
      }
      if (hourly_value !== undefined) {
        const value = Number(hourly_value);
        if (!isValidHourlyValue(value)) {
          return res.status(400).send({ message: 'Valor por hora inválido' });
        }
        where.hourly_value = value;
      }
      if (created_at) {
        const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(created_at);
        if (!match) {
          return res.status(400).send({ message: 'Data de criação inválida' });
        }
        const [, day, month, year] = match;
        const start = new Date(Number(year), Number(month) - 1, Number(day));
        if (start.getDate() !== Number(day) || start.getMonth() !== Number(month) - 1) {
          return res.status(400).send({ message: 'Data de criação inválida' });
        }
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.createdAt = { [Op.gte]: start, [Op.lt]: end };
      }

      const projects = await Projects.findAll({
        where,
        attributes: projectAttributes,
        order: [['project_name', 'ASC']],
      });

      return res.status(200).send({ projects });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar projetos');
      return res.status(500).send({ message: 'Erro ao buscar projetos', error: (error as Error).message });
    }
  },

  getProject: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { user_id } = req.user;
      const { project_id } = req.params as ProjectParams;

      const project = await Projects.findOne({
        where: { id: project_id, user_id },
        attributes: projectAttributes,
      });

      if (!project) {
        return res.status(404).send({ message: 'Projeto não encontrado' });
      }

      return res.status(200).send({ project });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao buscar projeto');
      return res.status(500).send({ message: 'Erro ao buscar projeto', error: (error as Error).message });
    }
  },

  updateProject: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { project_id } = req.params as ProjectParams;
      const { project_name, hourly_value } = req.body as ProjectBody;

      if (project_name !== undefined && !project_name) {
        return res.status(400).send({ message: 'Nome do projeto não informado' });
      }
      if (hourly_value !== undefined && !isValidHourlyValue(hourly_value)) {
        return res.status(400).send({ message: 'Valor por hora inválido' });
      }

      const project = await Projects.findOne({
        where: { id: project_id, user_id },
        attributes: ['id', 'project_name'],
      });

      if (!project) {
        return res.status(404).send({ message: 'Projeto não encontrado' });
      }

      if (project_name !== undefined && project_name !== project.get('project_name')) {
        const nameInUse = await Projects.findOne({
          where: { user_id, project_name },
          attributes: ['id'],
        });

        if (nameInUse) {
          return res.status(400).send({ message: 'Nome do projeto já em uso' });
        }
      }

      const updateData: ProjectBody = {};
      if (project_name !== undefined) updateData.project_name = project_name;
      if (hourly_value !== undefined) updateData.hourly_value = hourly_value;

      transaction = await db.transaction();

      await Projects.update(updateData, { where: { id: project_id, user_id }, transaction });

      await transaction.commit();
      return res.status(200).send({ message: 'Projeto atualizado com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao atualizar projeto');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao atualizar projeto', error: (error as Error).message });
    }
  },

  deleteProject: async (req: FastifyRequest, res: FastifyReply) => {
    let transaction: Transaction | undefined;
    try {
      const { user_id } = req.user;
      const { project_id } = req.params as ProjectParams;

      const project = await Projects.findOne({
        where: { id: project_id, user_id },
        attributes: ['id'],
      });

      if (!project) {
        return res.status(404).send({ message: 'Projeto não encontrado' });
      }

      const hasExtraHours = await ExtraHours.findOne({
        where: { project_id, user_id },
        attributes: ['id'],
      });

      if (hasExtraHours) {
        return res.status(400).send({ message: 'Projeto possui horas extras' });
      }

      transaction = await db.transaction();

      await Projects.destroy({ where: { id: project_id, user_id }, transaction });

      await transaction.commit();
      return res.status(200).send({ message: 'Projeto excluído com sucesso' });
    } catch (error) {
      req.log.error({ err: error }, 'Erro ao excluir projeto');
      await transaction?.rollback();
      return res.status(500).send({ message: 'Erro ao excluir projeto', error: (error as Error).message });
    }
  },
};

export default ProjectsController;
