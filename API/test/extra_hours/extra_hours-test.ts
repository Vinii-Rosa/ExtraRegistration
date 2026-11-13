import { describe, expect, test } from '@jest/globals';
import { callAssertError, callAssertSuccess, createProject, defaultReq, defaultUserData, ensureOtherData } from '../../utils/test_helpers.js';
import ExtraHoursController from '../../controllers/extra_hours/index.js';
import ProjectsController from '../../controllers/projects/index.js';
import MonthlyTotals from '../../models/monthly_totals.js';

async function createExtra(body: Record<string, any>, reqOverrides: Record<string, any> = {}) {
  await callAssertSuccess(ExtraHoursController.createExtraHour, { ...defaultReq, ...reqOverrides, body }, 201);
}

async function listExtras(query: Record<string, any> = {}, reqOverrides: Record<string, any> = {}) {
  return callAssertSuccess(ExtraHoursController.getExtraHours, { ...defaultReq, ...reqOverrides, query }, 200);
}

async function findExtra(project_id: string, date: string, start_time: string) {
  const { extra_hours } = await listExtras({ date, limit: '100' });
  return extra_hours.find((item: any) => item.project_id === project_id && item.start_time.startsWith(start_time));
}

async function projectProfit(project_id: string) {
  const { project } = await callAssertSuccess(ProjectsController.getProject, { ...defaultReq, params: { project_id } }, 200);
  return project.total_profit;
}

async function monthTotal(month: string, user_id = defaultUserData.id) {
  const row = await MonthlyTotals.findOne({ where: { user_id, month }, raw: true }) as any;
  return row ? row.total : null;
}

describe('ExtraHoursController', () => {
  test('Criando uma hora extra aberta', async () => {
    const project = await createProject('Extra Aberto', 60);
    await createExtra({ project_id: project.id, date: '03/11/2026', start_time: '18:00', card_name: 'Card A', card_link: 'https://x.com/a' });

    const extra = await findExtra(project.id, '03/11/2026', '18:00');
    expect(extra.card_name).toBe('Card A');
    expect(extra.card_link).toBe('https://x.com/a');
    expect(extra.end_time).toBeNull();
    expect(extra.total_value).toBeNull();
    expect(extra.total_minutes).toBeNull();
    expect(extra.description).toBeNull();
    expect(await projectProfit(project.id)).toBe(0);
    expect(await monthTotal('2026-11')).toBe(0);
  });

  test('Criando uma hora extra fechada calcula o valor', async () => {
    const project = await createProject('Extra Fechado', 60);
    await createExtra({ project_id: project.id, date: '04/12/2026', start_time: '18:00', end_time: '20:00' });

    const extra = await findExtra(project.id, '04/12/2026', '18:00');
    expect(extra.total_value).toBe(120);
    expect(extra.total_minutes).toBe(120);
    expect(await projectProfit(project.id)).toBe(120);
    expect(await monthTotal('2026-12')).toBe(120);
  });

  test('Fechando uma hora extra pelo update', async () => {
    const project = await createProject('Extra Fechar', 60);
    await createExtra({ project_id: project.id, date: '05/01/2027', start_time: '18:00' });
    const { extra_hours } = await listExtras({ month: '2027-01' });
    const extra = extra_hours[0];

    await callAssertSuccess(ExtraHoursController.updateExtraHour, {
      ...defaultReq,
      params: { extra_hour_id: extra.id },
      body: { end_time: '20:00' },
    }, 200);

    const updated = await findExtra(project.id, '05/01/2027', '18:00');
    expect(updated.total_value).toBe(120);
    expect(updated.total_minutes).toBe(120);
    expect(await projectProfit(project.id)).toBe(120);
    expect(await monthTotal('2027-01')).toBe(120);
  });

  test('Descrição é gravada, alterada e limpa', async () => {
    const project = await createProject('Extra Descrição', 60);
    await createExtra({ project_id: project.id, date: '15/02/2027', start_time: '18:00', end_time: '19:00', description: 'Ajuste no login' });

    const extra = await findExtra(project.id, '15/02/2027', '18:00');
    expect(extra.description).toBe('Ajuste no login');

    async function update(body: Record<string, any>) {
      await callAssertSuccess(ExtraHoursController.updateExtraHour, {
        ...defaultReq,
        params: { extra_hour_id: extra.id },
        body,
      }, 200);
      return (await findExtra(project.id, '15/02/2027', '18:00')).description;
    }

    expect(await update({ description: 'Correção no deploy' })).toBe('Correção no deploy');
    expect(await update({ end_time: '19:30' })).toBe('Correção no deploy');
    expect(await update({ description: '' })).toBeNull();
  });

  test('Virada de dia conta no mês do campo date', async () => {
    const project = await createProject('Extra Virada', 60);
    await createExtra({ project_id: project.id, date: '31/03/2027', start_time: '23:00', end_time: '01:00' });

    const extra = await findExtra(project.id, '31/03/2027', '23:00');
    expect(extra.total_value).toBe(120);
    expect(extra.total_minutes).toBe(120);
    expect(await monthTotal('2027-03')).toBe(120);
    expect(await monthTotal('2027-04')).toBeNull();
  });

  test('Trocando de mês e de projeto refaz os totais', async () => {
    const first = await createProject('Troca Origem', 60);
    const second = await createProject('Troca Destino', 100);
    await createExtra({ project_id: first.id, date: '10/05/2027', start_time: '18:00', end_time: '20:00' });
    const { extra_hours } = await listExtras({ month: '2027-05' });
    const extra = extra_hours.find((item: any) => item.project_id === first.id);

    await callAssertSuccess(ExtraHoursController.updateExtraHour, {
      ...defaultReq,
      params: { extra_hour_id: extra.id },
      body: { project_id: second.id, date: '10/06/2027' },
    }, 200);

    expect((await findExtra(second.id, '10/06/2027', '18:00')).total_value).toBe(200);
    expect(await projectProfit(first.id)).toBe(0);
    expect(await projectProfit(second.id)).toBe(200);
    expect(await monthTotal('2027-05')).toBe(0);
    expect(await monthTotal('2027-06')).toBe(200);
  });

  test('Deletando uma hora extra refaz os totais', async () => {
    const project = await createProject('Extra Deletar', 60);
    await createExtra({ project_id: project.id, date: '10/07/2027', start_time: '18:00', end_time: '19:00' });
    const { extra_hours } = await listExtras({ month: '2027-07' });
    expect(await monthTotal('2027-07')).toBe(60);

    const body = await callAssertSuccess(ExtraHoursController.deleteExtraHour, {
      ...defaultReq,
      params: { extra_hour_id: extra_hours[0].id },
    }, 200);
    expect(body.message).toBe('Hora extra excluída com sucesso');
    await callAssertError(ExtraHoursController.getExtraHour, {
      ...defaultReq,
      params: { extra_hour_id: extra_hours[0].id },
    }, 'Hora extra não encontrada');
    expect(await projectProfit(project.id)).toBe(0);
    expect(await monthTotal('2027-07')).toBe(0);
  });

  test('Erros de validação ao criar', async () => {
    const project = await createProject('Extra Validação', 60);
    const base = { project_id: project.id, date: '03/11/2026', start_time: '18:00' };
    const cases: [Record<string, any>, string][] = [
      [{ ...base, project_id: undefined }, 'Projeto não informado'],
      [{ ...base, date: undefined }, 'Data não informada'],
      [{ ...base, date: '2026-11-03' }, 'Data inválida'],
      [{ ...base, start_time: undefined }, 'Hora de início não informada'],
      [{ ...base, start_time: '25:00' }, 'Hora de início inválida'],
      [{ ...base, end_time: '99:99' }, 'Hora de fim inválida'],
      [{ ...base, end_time: '18:00' }, 'Hora de fim igual à hora de início'],
    ];
    for (const [body, message] of cases) {
      await callAssertError(ExtraHoursController.createExtraHour, { ...defaultReq, body }, message);
    }
  });

  test('Erro ao criar com projeto inexistente ou de outro usuário', async () => {
    const { loggedUser } = await ensureOtherData();
    const otherProject = await createProject('Projeto Alheio Extra', 50, { user: loggedUser });

    await callAssertError(ExtraHoursController.createExtraHour, {
      ...defaultReq,
      body: { project_id: otherProject.id, date: '03/11/2026', start_time: '18:00' },
    }, 'Projeto não encontrado');
    await callAssertError(ExtraHoursController.createExtraHour, {
      ...defaultReq,
      body: { project_id: 'inexistente', date: '03/11/2026', start_time: '18:00' },
    }, 'Projeto não encontrado');
  });

  test('Buscando uma hora extra pelo id', async () => {
    const project = await createProject('Extra Busca', 60);
    await createExtra({ project_id: project.id, date: '01/08/2027', start_time: '09:00', end_time: '10:00', card_name: 'Busca' });
    const { extra_hours } = await listExtras({ date: '01/08/2027' });

    const body = await callAssertSuccess(ExtraHoursController.getExtraHour, {
      ...defaultReq,
      params: { extra_hour_id: extra_hours[0].id },
    }, 200);
    expect(body.extra_hour.card_name).toBe('Busca');
    expect(body.extra_hour.total_value).toBe(60);
    expect(body.extra_hour.total_minutes).toBe(60);
  });

  test('Erro 404 ao buscar, atualizar ou excluir hora extra inexistente', async () => {
    const params = { extra_hour_id: 'inexistente' };
    await callAssertError(ExtraHoursController.getExtraHour, { ...defaultReq, params }, 'Hora extra não encontrada');
    await callAssertError(ExtraHoursController.updateExtraHour, { ...defaultReq, params, body: { end_time: '20:00' } }, 'Hora extra não encontrada');
    await callAssertError(ExtraHoursController.deleteExtraHour, { ...defaultReq, params }, 'Hora extra não encontrada');
  });

  test('Outro usuário não acessa hora extra alheia', async () => {
    const project = await createProject('Extra Privado', 60);
    await createExtra({ project_id: project.id, date: '02/09/2027', start_time: '18:00', end_time: '19:00' });
    const { extra_hours } = await listExtras({ date: '02/09/2027' });
    const { loggedUser } = await ensureOtherData();
    const params = { extra_hour_id: extra_hours[0].id };

    await callAssertError(ExtraHoursController.getExtraHour, { ...defaultReq, params, user: loggedUser }, 'Hora extra não encontrada');
    await callAssertError(ExtraHoursController.updateExtraHour, { ...defaultReq, params, user: loggedUser, body: { end_time: '20:00' } }, 'Hora extra não encontrada');
    await callAssertError(ExtraHoursController.deleteExtraHour, { ...defaultReq, params, user: loggedUser }, 'Hora extra não encontrada');
    const other = await listExtras({ date: '02/09/2027' }, { user: loggedUser });
    expect(other.extra_hours).toHaveLength(0);
  });

  describe('Listagem', () => {
    test('Paginação, ordenação e filtros', async () => {
      const project = await createProject('Extra Lista', 60);
      const { loggedUser } = await ensureOtherData();
      const month = '2028-02';
      await createExtra({ project_id: project.id, date: '10/02/2028', start_time: '18:00', end_time: '20:00' });
      await createExtra({ project_id: project.id, date: '10/02/2028', start_time: '09:30', end_time: '10:00' });
      await createExtra({ project_id: project.id, date: '11/02/2028', start_time: '18:45', end_time: '19:45' });
      await createExtra({ project_id: project.id, date: '12/03/2028', start_time: '18:00' });
      await createExtra({ project_id: (await createProject('Extra Lista Alheia', 10, { user: loggedUser })).id, date: '10/02/2028', start_time: '18:00', end_time: '19:00' }, { user: loggedUser });

      const all = await listExtras({ month });
      expect(all.count).toBe(3);
      expect(all.extra_hours.map((item: any) => `${item.date} ${item.start_time.slice(0, 5)}`)).toEqual([
        '2028-02-11 18:45', '2028-02-10 18:00', '2028-02-10 09:30',
      ]);

      const paged = await listExtras({ month, page: '2', limit: '2' });
      expect(paged).toMatchObject({ count: 3, page: 2, limit: 2, total_pages: 2 });
      expect(paged.extra_hours).toHaveLength(1);

      expect((await listExtras({ date: '10/02/2028' })).count).toBe(2);
      expect((await listExtras({ month, hour: '18' })).count).toBe(2);
      expect((await listExtras({ month, hour: '9' })).count).toBe(1);
      expect((await listExtras({ month, total_value: '120' })).count).toBe(1);
      expect((await listExtras({ month, total_value: '60' })).count).toBe(1);
    });

    test('Filtro por intervalo de datas', async () => {
      const project = await createProject('Extra Intervalo', 60);
      for (const date of ['01/04/2028', '10/04/2028', '11/04/2028', '30/04/2028']) {
        await createExtra({ project_id: project.id, date, start_time: '18:00', end_time: '20:00' });
      }

      async function dates(query: Record<string, any>) {
        const { extra_hours } = await listExtras({ ...query, limit: '100' });
        return extra_hours.filter((item: any) => item.project_id === project.id).map((item: any) => item.date);
      }

      expect(await dates({ date_from: '01/04/2028', date_to: '10/04/2028' })).toEqual(['2028-04-10', '2028-04-01']);
      expect(await dates({ date_from: '11/04/2028' })).toEqual(['2028-04-30', '2028-04-11']);
      expect(await dates({ date_to: '01/04/2028' })).toEqual(['2028-04-01']);
      expect(await dates({ date_from: '10/04/2028', date_to: '10/04/2028' })).toEqual(['2028-04-10']);
      expect(await dates({ date_from: '05/04/2028', date_to: '09/04/2028' })).toEqual([]);
      // O intervalo tem prioridade sobre date e month
      expect(await dates({ date_from: '30/04/2028', date: '01/04/2028', month: '2028-03' })).toEqual(['2028-04-30']);
    });

    test('Erros de parâmetros inválidos', async () => {
      const cases: [Record<string, any>, string][] = [
        [{ page: '0' }, 'Página inválida'],
        [{ limit: '101' }, 'Limite inválido'],
        [{ limit: 'abc' }, 'Limite inválido'],
        [{ date: '2026-11-03' }, 'Data inválida'],
        [{ month: '11/2026' }, 'Mês inválido'],
        [{ date_from: '2026-11-03' }, 'Data inicial inválida'],
        [{ date_to: '31/02/2026' }, 'Data final inválida'],
        [{ date_from: '10/11/2026', date_to: '09/11/2026' }, 'Data inicial maior que a data final'],
        [{ hour: '24' }, 'Hora inválida'],
        [{ total_value: 'abc' }, 'Valor inválido'],
      ];
      for (const [query, message] of cases) {
        await callAssertError(ExtraHoursController.getExtraHours, { ...defaultReq, query }, message);
      }
    });
  });
});
