import { describe, expect, test } from '@jest/globals';
import { callAssertError, callAssertSuccess, createProject, defaultReq, ensureDefaultData, ensureOtherData } from '../../utils/test_helpers.js';
import ProjectsController from '../../controllers/projects/index.js';
import ExtraHours from '../../models/extra_hours.js';

async function getProject(project_id: string) {
  const body = await callAssertSuccess(ProjectsController.getProject, {
    ...defaultReq,
    params: { project_id },
  }, 200);
  return body.project;
}

async function listProjects(query: Record<string, any> = {}) {
  const body = await callAssertSuccess(ProjectsController.getProjects, { ...defaultReq, query }, 200);
  return body.projects.map((project: any) => project.project_name);
}

async function createOtherProject(project_name: string) {
  const { loggedUser } = await ensureOtherData();
  return createProject(project_name, 50, { user: loggedUser });
}

describe('ProjectsController', () => {
  test('Criando um projeto novo', async () => {
    const body = await callAssertSuccess(ProjectsController.createProject, {
      ...defaultReq,
      body: { project_name: 'Projeto Criado', hourly_value: 60 },
    }, 201);
    expect(body.message).toBe('Projeto criado com sucesso');

    const created = await createProject('Projeto Criado Busca', 60);
    const project = await getProject(created.id);
    expect(project.project_name).toBe('Projeto Criado Busca');
    expect(project.hourly_value).toBe(60);
    expect(project.total_profit).toBe(0);
  });

  test('total_profit enviado no body é ignorado', async () => {
    await callAssertSuccess(ProjectsController.createProject, {
      ...defaultReq,
      body: { project_name: 'Projeto Lucro', hourly_value: 10, total_profit: 999 },
    }, 201);

    const { projects } = await callAssertSuccess(ProjectsController.getProjects, {
      ...defaultReq,
      query: { project_name: 'Projeto Lucro' },
    }, 200);
    expect(projects[0].total_profit).toBe(0);
  });

  test('Erro ao criar projeto sem nome', async () => {
    await callAssertError(ProjectsController.createProject, {
      ...defaultReq,
      body: { hourly_value: 60 },
    }, 'Nome do projeto não informado');
  });

  test('Erro ao criar projeto sem valor por hora', async () => {
    await callAssertError(ProjectsController.createProject, {
      ...defaultReq,
      body: { project_name: 'Sem Valor' },
    }, 'Valor por hora não informado');
  });

  test('Erro ao criar projeto com valor por hora inválido', async () => {
    for (const hourly_value of [0, -5, 10.5, '60']) {
      await callAssertError(ProjectsController.createProject, {
        ...defaultReq,
        body: { project_name: 'Valor Inválido', hourly_value },
      }, 'Valor por hora inválido');
    }
  });

  test('Erro ao criar projeto com nome duplicado', async () => {
    await createProject('Projeto Duplicado');

    await callAssertError(ProjectsController.createProject, {
      ...defaultReq,
      body: { project_name: 'Projeto Duplicado', hourly_value: 70 },
    }, 'Nome do projeto já em uso');
  });

  test('Listando os projetos do usuário', async () => {
    await createProject('Projeto Lista');

    expect(await listProjects()).toContain('Projeto Lista');
  });

  test('Listagem não traz projetos de outro usuário', async () => {
    await createOtherProject('Projeto Alheio');

    expect(await listProjects()).not.toContain('Projeto Alheio');
  });

  test('Filtrando projetos por nome', async () => {
    await createProject('Filtro Alpha');
    await createProject('Filtro Beta');

    const names = await listProjects({ project_name: 'Alpha' });
    expect(names).toContain('Filtro Alpha');
    expect(names).not.toContain('Filtro Beta');
  });

  test('Filtrando projetos por valor por hora', async () => {
    await createProject('Valor 123', 123);
    await createProject('Valor 124', 124);

    const names = await listProjects({ hourly_value: '123' });
    expect(names).toContain('Valor 123');
    expect(names).not.toContain('Valor 124');
  });

  test('Filtrando projetos por data de criação', async () => {
    await createProject('Criado Hoje');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = `${pad(yesterdayDate.getDate())}/${pad(yesterdayDate.getMonth() + 1)}/${yesterdayDate.getFullYear()}`;

    expect(await listProjects({ created_at: today })).toContain('Criado Hoje');
    expect(await listProjects({ created_at: yesterday })).not.toContain('Criado Hoje');
  });

  test('Erro ao filtrar com valor por hora inválido', async () => {
    await callAssertError(ProjectsController.getProjects, {
      ...defaultReq,
      query: { hourly_value: 'abc' },
    }, 'Valor por hora inválido');
  });

  test('Erro ao filtrar com data de criação inválida', async () => {
    for (const created_at of ['2026-11-03', '31/02/2026']) {
      await callAssertError(ProjectsController.getProjects, {
        ...defaultReq,
        query: { created_at },
      }, 'Data de criação inválida');
    }
  });

  test('Buscando um projeto', async () => {
    const created = await createProject('Projeto Busca', 80);

    const project = await getProject(created.id);
    expect(project.project_name).toBe('Projeto Busca');
    expect(project.hourly_value).toBe(80);
  });

  test('Erro ao buscar projeto inexistente', async () => {
    await callAssertError(ProjectsController.getProject, {
      ...defaultReq,
      params: { project_id: 'nao-existe' },
    }, 'Projeto não encontrado');
  });

  test('Erro ao buscar projeto de outro usuário', async () => {
    const alheio = await createOtherProject('Alheio Busca');

    await callAssertError(ProjectsController.getProject, {
      ...defaultReq,
      params: { project_id: alheio.id },
    }, 'Projeto não encontrado');
  });

  test('Atualizando nome e valor por hora do projeto', async () => {
    const created = await createProject('Projeto Antigo');

    const body = await callAssertSuccess(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: created.id },
      body: { project_name: 'Projeto Novo', hourly_value: 90 },
    }, 200);
    expect(body.message).toBe('Projeto atualizado com sucesso');

    const project = await getProject(created.id);
    expect(project.project_name).toBe('Projeto Novo');
    expect(project.hourly_value).toBe(90);
  });

  test('Atualização parcial mantém os outros campos', async () => {
    const created = await createProject('Projeto Parcial', 60);

    await callAssertSuccess(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: created.id },
      body: { hourly_value: 75 },
    }, 200);

    const project = await getProject(created.id);
    expect(project.project_name).toBe('Projeto Parcial');
    expect(project.hourly_value).toBe(75);
  });

  test('Atualizar o valor por hora não altera os extras existentes', async () => {
    const created = await createProject('Projeto Com Extra', 60);
    const { user } = await ensureDefaultData();
    // ainda não existe controller de horas extras (fase 5)
    const extra = await ExtraHours.create({
      user_id: user.id,
      project_id: created.id,
      date: '2026-11-03',
      start_time: '18:00',
      end_time: '20:00',
      total_value: 120,
    });

    await callAssertSuccess(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: created.id },
      body: { hourly_value: 80 },
    }, 200);

    const after = await ExtraHours.findByPk(extra.id);
    expect(after!.get('total_value')).toBe(120);
  });

  test('Erro ao atualizar projeto com valor por hora inválido', async () => {
    const created = await createProject('Projeto Valor Ruim');

    await callAssertError(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: created.id },
      body: { hourly_value: 0 },
    }, 'Valor por hora inválido');
  });

  test('Erro ao atualizar projeto com nome duplicado', async () => {
    await createProject('Projeto Nome A');
    const b = await createProject('Projeto Nome B');

    await callAssertError(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: b.id },
      body: { project_name: 'Projeto Nome A' },
    }, 'Nome do projeto já em uso');
  });

  test('Erro ao atualizar projeto inexistente', async () => {
    await callAssertError(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: 'nao-existe' },
      body: { hourly_value: 10 },
    }, 'Projeto não encontrado');
  });

  test('Erro ao atualizar projeto de outro usuário', async () => {
    const alheio = await createOtherProject('Alheio Update');

    await callAssertError(ProjectsController.updateProject, {
      ...defaultReq,
      params: { project_id: alheio.id },
      body: { hourly_value: 10 },
    }, 'Projeto não encontrado');

    const { loggedUser } = await ensureOtherData();
    const body = await callAssertSuccess(ProjectsController.getProject, {
      ...defaultReq,
      user: loggedUser,
      params: { project_id: alheio.id },
    }, 200);
    expect(body.project.hourly_value).toBe(50);
  });

  test('Excluindo um projeto', async () => {
    const created = await createProject('Projeto Excluir');

    const body = await callAssertSuccess(ProjectsController.deleteProject, {
      ...defaultReq,
      params: { project_id: created.id },
    }, 200);
    expect(body.message).toBe('Projeto excluído com sucesso');

    await callAssertError(ProjectsController.getProject, {
      ...defaultReq,
      params: { project_id: created.id },
    }, 'Projeto não encontrado');
  });

  test('Erro ao excluir projeto com horas extras', async () => {
    const created = await createProject('Projeto Histórico');
    const { user } = await ensureDefaultData();
    // ainda não existe controller de horas extras (fase 5)
    await ExtraHours.create({
      user_id: user.id,
      project_id: created.id,
      date: '2026-11-03',
      start_time: '18:00',
    });

    await callAssertError(ProjectsController.deleteProject, {
      ...defaultReq,
      params: { project_id: created.id },
    }, 'Projeto possui horas extras');

    expect((await getProject(created.id)).project_name).toBe('Projeto Histórico');
  });

  test('Erro ao excluir projeto inexistente', async () => {
    await callAssertError(ProjectsController.deleteProject, {
      ...defaultReq,
      params: { project_id: 'nao-existe' },
    }, 'Projeto não encontrado');
  });

  test('Erro ao excluir projeto de outro usuário', async () => {
    const alheio = await createOtherProject('Alheio Delete');

    await callAssertError(ProjectsController.deleteProject, {
      ...defaultReq,
      params: { project_id: alheio.id },
    }, 'Projeto não encontrado');

    const { loggedUser } = await ensureOtherData();
    const body = await callAssertSuccess(ProjectsController.getProject, {
      ...defaultReq,
      user: loggedUser,
      params: { project_id: alheio.id },
    }, 200);
    expect(body.project.project_name).toBe('Alheio Delete');
  });
});
