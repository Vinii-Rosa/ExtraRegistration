import { describe, expect, test } from '@jest/globals';
import { callAssertError, callAssertSuccess, createProject, defaultReq, ensureOtherData } from '../../utils/test_helpers.js';
import MonthlyTotalsController from '../../controllers/monthly_totals/index.js';
import ExtraHoursController from '../../controllers/extra_hours/index.js';

async function createClosedExtra(project_id: string, date: string, start_time: string, end_time: string, req: Record<string, any> = {}) {
  await callAssertSuccess(ExtraHoursController.createExtraHour, {
    ...defaultReq,
    ...req,
    body: { project_id, date, start_time, end_time },
  }, 201);
}

describe('MonthlyTotalsController', () => {
  test('Listando as somas mensais do usuário', async () => {
    const project = await createProject('Projeto Soma Lista', 60);
    await createClosedExtra(project.id, '03/05/2026', '18:00', '20:00');
    await createClosedExtra(project.id, '04/06/2026', '18:00', '19:00');

    const body = await callAssertSuccess(MonthlyTotalsController.getMonthlyTotals, defaultReq, 200);
    const months = body.monthly_totals.map((item: any) => item.month);
    expect(months.indexOf('2026-06')).toBeLessThan(months.indexOf('2026-05'));
    expect(body.monthly_totals.find((item: any) => item.month === '2026-05').total).toBe(120);
    expect(body.monthly_totals.find((item: any) => item.month === '2026-06').total).toBe(60);
  });

  test('Buscando a soma de um mês', async () => {
    const project = await createProject('Projeto Soma Mes', 60);
    await createClosedExtra(project.id, '03/07/2026', '18:00', '20:30');

    const body = await callAssertSuccess(MonthlyTotalsController.getMonthlyTotal, {
      ...defaultReq,
      params: { month: '2026-07' },
    }, 200);
    expect(body.monthly_total.month).toBe('2026-07');
    expect(body.monthly_total.total).toBe(150);
  });

  test('Mês sem registro retorna total zero', async () => {
    const body = await callAssertSuccess(MonthlyTotalsController.getMonthlyTotal, {
      ...defaultReq,
      params: { month: '2001-01' },
    }, 200);
    expect(body.monthly_total).toEqual({ month: '2001-01', total: 0 });
  });

  test('Mês inválido retorna erro', async () => {
    await callAssertError(MonthlyTotalsController.getMonthlyTotal, {
      ...defaultReq,
      params: { month: '2026-13' },
    }, 'Mês inválido');
    await callAssertError(MonthlyTotalsController.getMonthlyTotal, {
      ...defaultReq,
      params: { month: 'novembro' },
    }, 'Mês inválido');
  });

  test('Outro usuário não vê a soma do usuário logado', async () => {
    const project = await createProject('Projeto Soma Outro', 60);
    await createClosedExtra(project.id, '03/08/2026', '18:00', '20:00');

    const { loggedUser } = await ensureOtherData();
    const single = await callAssertSuccess(MonthlyTotalsController.getMonthlyTotal, {
      ...defaultReq,
      user: loggedUser,
      params: { month: '2026-08' },
    }, 200);
    expect(single.monthly_total.total).toBe(0);

    const list = await callAssertSuccess(MonthlyTotalsController.getMonthlyTotals, {
      ...defaultReq,
      user: loggedUser,
    }, 200);
    expect(list.monthly_totals.find((item: any) => item.month === '2026-08')).toBeUndefined();
  });
});
