import { describe, expect, test } from '@jest/globals';
import ExcelJS from 'exceljs';
import { callAssertError, callAssertSuccess, createProject, defaultReq, ensureOtherData, loginUser, mockReply } from '../../utils/test_helpers.js';
import ExtraHoursController from '../../controllers/extra_hours/index.js';

async function createExtra(body: Record<string, any>, reqOverrides: Record<string, any> = {}) {
  await callAssertSuccess(ExtraHoursController.createExtraHour, { ...defaultReq, ...reqOverrides, body }, 201);
}

async function exportMonth(month: string, reqOverrides: Record<string, any> = {}) {
  const buffer = await callAssertSuccess(ExtraHoursController.exportExtraHours, { ...defaultReq, ...reqOverrides, query: { month } }, 200);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook.worksheets[0];
}

describe('ExtraHoursController - exportação', () => {
  test('Exportando o mês com colunas, linhas e total', async () => {
    const project = await createProject('Export Mes', 60);
    await createExtra({ project_id: project.id, date: '10/03/2030', start_time: '18:00', end_time: '20:00', card_name: 'Card X', card_link: 'https://x.com/x' });
    await createExtra({ project_id: project.id, date: '11/03/2030', start_time: '19:00', end_time: '20:30' });
    await createExtra({ project_id: project.id, date: '12/03/2030', start_time: '18:00' });
    await createExtra({ project_id: project.id, date: '01/04/2030', start_time: '18:00', end_time: '19:00' });

    const sheet = await exportMonth('2030-03');

    expect(sheet.getRow(1).values).toEqual([undefined, 'Data', 'Nome do card', 'Link do card', 'Hora de início', 'Hora de fim', 'Valor']);
    expect(sheet.rowCount).toBe(5);

    const first = sheet.getRow(2);
    expect((first.getCell(1).value as Date).toISOString().slice(0, 10)).toBe('2030-03-10');
    expect(first.getCell(1).numFmt).toBe('DD/MM/YYYY');
    expect(first.getCell(2).value).toBe('Card X');
    expect(first.getCell(3).value).toEqual({ text: 'https://x.com/x', hyperlink: 'https://x.com/x' });
    expect(first.getCell(3).alignment?.horizontal).toBe('fill');
    expect(first.getCell(4).value).toBe('18:00');
    expect(first.getCell(5).value).toBe('20:00');
    expect(first.getCell(6).value).toBe(120);
    expect(first.getCell(6).numFmt).toBe('"R$" #,##0');
    expect(sheet.getColumn(3).width).toBe(40);

    expect(sheet.getRow(3).getCell(6).value).toBe(90);

    const open = sheet.getRow(4);
    expect(open.getCell(4).value).toBe('18:00');
    expect(open.getCell(5).value).toBeNull();
    expect(open.getCell(6).value).toBeNull();

    const total = sheet.getRow(5);
    expect(total.getCell(1).value).toBe('Total do mês');
    expect(total.getCell(6).value).toBe(210);
  });

  test('Exportando devolve os headers do arquivo', async () => {
    const project = await createProject('Export Header', 60);
    await createExtra({ project_id: project.id, date: '10/05/2030', start_time: '18:00', end_time: '19:00' });

    const { req } = await loginUser({ query: { month: '2030-05' } });
    const res = mockReply();
    await ExtraHoursController.exportExtraHours(req, res);

    expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="extras-2030-05.xlsx"');
  });

  test('Exportando mês sem extras', async () => {
    await callAssertError(ExtraHoursController.exportExtraHours, { ...defaultReq, query: { month: '2031-01' } }, 'Nenhuma hora extra encontrada no mês');
  });

  test('Exportando sem mês ou com mês inválido', async () => {
    await callAssertError(ExtraHoursController.exportExtraHours, { ...defaultReq }, 'Mês não informado');
    await callAssertError(ExtraHoursController.exportExtraHours, { ...defaultReq, query: { month: '2030-13' } }, 'Mês inválido');
  });

  test('Exportando não inclui extras de outro usuário', async () => {
    const project = await createProject('Export Outro', 60);
    await createExtra({ project_id: project.id, date: '10/06/2030', start_time: '18:00', end_time: '19:00' });

    const { loggedUser } = await ensureOtherData();
    await callAssertError(ExtraHoursController.exportExtraHours, { ...defaultReq, query: { month: '2030-06' }, user: loggedUser }, 'Nenhuma hora extra encontrada no mês');
  });
});
