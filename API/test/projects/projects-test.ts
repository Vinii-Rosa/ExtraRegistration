import { describe, expect, test } from '@jest/globals';
import moment from 'moment';
import { callAssertError, callAssertSuccess, createProject, defaultReq, ensureDefaultData, ensureOtherData } from '../../utils/test_helpers.js';
import ProjectsController from '../../controllers/projects/index.js';
import ExtraHoursController from '../../controllers/extra_hours/index.js';
import ExtraHours from '../../models/extra_hours.js';
import MonthlyTotals from '../../models/monthly_totals.js';

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

async function createExtra(project_id: string, date: string, start_time: string, end_time?: string) {
  await callAssertSuccess(ExtraHoursController.createExtraHour, {
    ...defaultReq,
    body: { project_id, date, start_time, end_time },
  }, 201);
  const { extra_hours } = await callAssertSuccess(ExtraHoursController.getExtraHours, {
    ...defaultReq,
    query: { date, limit: '100' },
  }, 200);
  return extra_hours.find((item: any) => item.project_id === project_id && item.start_time.startsWith(start_time));
}

async function getExtra(extra_hour_id: string) {
  const body = await callAssertSuccess(ExtraHoursController.getExtraHour, {
    ...defaultReq,
    params: { extra_hour_id },
  }, 200);
  return body.extra_hour;
}

async function recalculate(project_id: string, body: Record<string, any>) {
  return callAssertSuccess(ProjectsController.recalculateExtraHours, {
    ...defaultReq,
    params: { project_id },
    body,
  }, 200);
}

async function changeHourlyValue(project_id: string, hourly_value: number) {
  await callAssertSuccess(ProjectsController.updateProject, {
    ...defaultReq,
    params: { project_id },
    body: { hourly_value },
  }, 200);
}

async function monthTotal(month: string) {
  const row = await MonthlyTotals.findOne({ where: { user_id: 'user-test-0001', month }, raw: true }) as any;
  return row ? row.total : null;
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
    const today = moment().format('DD/MM/YYYY');
    const yesterday = moment().subtract(1, 'day').format('DD/MM/YYYY');

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

  test('Recalculando extras selecionados com o valor por hora atual', async () => {
    const project = await createProject('Recalc Selecionados', 60);
    const um = await createExtra(project.id, '03/12/2026', '18:00', '20:00');
    const dois = await createExtra(project.id, '04/12/2026', '18:00', '20:00');
    await changeHourlyValue(project.id, 80);

    const body = await recalculate(project.id, { scope: 'selected', extra_hour_ids: [um.id] });
    expect(body.message).toBe('Horas extras recalculadas com sucesso');

    expect((await getExtra(um.id)).total_value).toBe(160);
    expect((await getExtra(dois.id)).total_value).toBe(120);
    expect((await getProject(project.id)).total_profit).toBe(280);
  });

  test('Recalculando extras de um mês', async () => {
    const project = await createProject('Recalc Mês', 60);
    const novembro = await createExtra(project.id, '03/01/2027', '18:00', '20:00');
    const dezembro = await createExtra(project.id, '03/02/2027', '18:00', '20:00');
    await changeHourlyValue(project.id, 80);

    await recalculate(project.id, { scope: 'month', month: '2027-01' });

    expect((await getExtra(novembro.id)).total_value).toBe(160);
    expect((await getExtra(dezembro.id)).total_value).toBe(120);
    expect(await monthTotal('2027-01')).toBeGreaterThanOrEqual(160);
    expect((await getProject(project.id)).total_profit).toBe(280);
  });

  test('Recalculando todos os extras e ignorando os abertos', async () => {
    const project = await createProject('Recalc Todos', 60);
    const um = await createExtra(project.id, '03/03/2027', '18:00', '20:00');
    const dois = await createExtra(project.id, '03/04/2027', '18:00', '19:00');
    const aberto = await createExtra(project.id, '03/05/2027', '18:00');
    await changeHourlyValue(project.id, 80);

    await recalculate(project.id, { scope: 'all' });

    expect((await getExtra(um.id)).total_value).toBe(160);
    expect((await getExtra(dois.id)).total_value).toBe(80);
    expect((await getExtra(aberto.id)).total_value).toBeNull();
    expect((await getProject(project.id)).total_profit).toBe(240);
  });

  test('Erro ao recalcular com escopo inválido ou ausente', async () => {
    const project = await createProject('Recalc Escopo', 60);

    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: project.id },
      body: {},
    }, 'Escopo não informado');
    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: project.id },
      body: { scope: 'nada' },
    }, 'Escopo inválido');
  });

  test('Recalculando selecionados sem enviar extras não altera nada', async () => {
    const project = await createProject('Recalc Sem Extras', 60);
    const extra = await createExtra(project.id, '03/07/2027', '18:00', '20:00');
    await changeHourlyValue(project.id, 80);

    await recalculate(project.id, { scope: 'selected' });
    await recalculate(project.id, { scope: 'selected', extra_hour_ids: [] });

    expect((await getExtra(extra.id)).total_value).toBe(120);
  });

  test('Erro ao recalcular com dados faltando para o escopo', async () => {
    const project = await createProject('Recalc Faltando', 60);

    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: project.id },
      body: { scope: 'month' },
    }, 'Mês não informado');
    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: project.id },
      body: { scope: 'month', month: '11/2026' },
    }, 'Mês inválido');
  });

  test('Erro ao recalcular extras de outro projeto', async () => {
    const project = await createProject('Recalc Projeto A', 60);
    const outro = await createProject('Recalc Projeto B', 60);
    const extra = await createExtra(outro.id, '03/06/2027', '18:00', '20:00');
    await changeHourlyValue(outro.id, 80);

    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: project.id },
      body: { scope: 'selected', extra_hour_ids: [extra.id] },
    }, 'Horas extras inválidas para o projeto');

    expect((await getExtra(extra.id)).total_value).toBe(120);
  });

  test('Erro ao recalcular extras de outro usuário', async () => {
    const alheio = await createOtherProject('Recalc Alheio');

    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: alheio.id },
      body: { scope: 'all' },
    }, 'Projeto não encontrado');
  });

  test('Erro ao recalcular projeto inexistente', async () => {
    await callAssertError(ProjectsController.recalculateExtraHours, {
      ...defaultReq,
      params: { project_id: 'nao-existe' },
      body: { scope: 'all' },
    }, 'Projeto não encontrado');
  });
});
