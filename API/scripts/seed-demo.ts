// Popula uma API local com um usuário de teste, vários projetos e extras em meses diferentes.
// Uso: API_URL=http://localhost:3002 node --import tsx scripts/seed-demo.ts

const API_URL = (process.env.API_URL ?? 'http://localhost:3002').replace(/\/$/, '');

const USER = { name: 'Usuário Demo', email: 'demo@teste.com', password: 'demo1234' };

const PROJECTS = [
  { project_name: 'Portal do Cliente', hourly_value: 60 },
  { project_name: 'App Mobile', hourly_value: 85 },
  { project_name: 'Integração ERP', hourly_value: 120 },
  { project_name: 'Site Institucional', hourly_value: 45 },
  { project_name: 'Dashboard BI', hourly_value: 95 },
  { project_name: 'Loja Virtual', hourly_value: 70 },
  { project_name: 'API de Pagamentos', hourly_value: 110 },
  { project_name: 'Painel Administrativo', hourly_value: 65 },
  { project_name: 'Automação de Testes', hourly_value: 80 },
  { project_name: 'Migração para Cloud', hourly_value: 130 },
  { project_name: 'Chatbot de Atendimento', hourly_value: 90 },
  { project_name: 'Relatórios Financeiros', hourly_value: 75 },
  { project_name: 'App de Entregas', hourly_value: 100 },
];

const CARDS = [
  'Corrigir bug no login', 'Ajuste de layout', 'Deploy em produção', 'Migração de banco',
  'Revisão de código', 'Nova tela de relatórios', 'Integração com API', 'Hotfix urgente',
  'Testes de regressão', 'Suporte ao cliente',
];

// [início, fim | null]: horários variados para exercitar o filtro de hora de início
const SLOTS: [string, string | null][] = [
  ['08:00', '10:00'], ['09:30', '12:00'], ['12:00', '13:30'], ['14:00', '16:30'],
  ['18:00', '20:00'], ['18:30', '21:00'], ['19:00', '22:30'], ['20:00', '23:00'],
  ['06:00', '08:00'], ['22:00', null],
];

async function call(path: string, method: string, body?: unknown, token?: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

async function must<T>(path: string, method: string, body?: unknown, token?: string) {
  const { res, data } = await call(path, method, body, token);
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${data?.message ?? ''}`);
  return data as T;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

async function main() {
  const created = await call('/users/user/create', 'POST', USER);
  if (!created.res.ok && created.data?.message !== 'Email já em uso') {
    throw new Error(`Criar usuário -> ${created.res.status} ${created.data?.message}`);
  }

  const { token } = await must<{ token: string }>(
    '/login/login', 'POST', { email: USER.email, password: USER.password },
  );

  const { projects: current } = await must<{ projects: { id: string; project_name: string }[] }>(
    '/projects/projects', 'GET', undefined, token,
  );
  for (const p of PROJECTS) {
    if (!current.some((c) => c.project_name === p.project_name)) {
      await must('/projects/project/create', 'POST', p, token);
    }
  }
  const { projects } = await must<{ projects: { id: string; project_name: string }[] }>(
    '/projects/projects', 'GET', undefined, token,
  );
  const ids = PROJECTS.map((p) => projects.find((c) => c.project_name === p.project_name)!.id);

  const existing = await must<{ count: number }>('/extra-hours/extra-hours?page=1&limit=1', 'GET', undefined, token);
  if (existing.count > 0) {
    console.log(`Usuário ${USER.email} já tem ${PROJECTS.length} projetos e ${existing.count} extras; nada a fazer.`);
    return;
  }

  // Junho a novembro de 2026; dias e horários determinísticos (sem aleatoriedade)
  const months = [6, 7, 8, 9, 10, 11];
  let total = 0;
  for (const [mi, month] of months.entries()) {
    const perMonth = 6 + ((mi * 3) % 5);
    for (let i = 0; i < perMonth; i++) {
      const day = 1 + ((i * 5 + mi * 3) % 28);
      const [start, end] = SLOTS[(i + mi) % SLOTS.length];
      // só o mês mais recente tem extras em aberto
      const open = end === null && month !== 11;
      await must('/extra-hours/extra-hour/create', 'POST', {
        project_id: ids[(i + mi) % 5],
        date: `${pad(day)}/${pad(month)}/2026`,
        start_time: start,
        end_time: open ? '23:30' : end,
        card_name: i % 4 === 3 ? null : CARDS[(i * 3 + mi) % CARDS.length],
        card_link: i % 3 === 0 ? `https://exemplo.com/cards/${mi}${i}` : null,
      }, token);
      total++;
    }
  }

  console.log(`Criados ${PROJECTS.length} projetos e ${total} extras para ${USER.email}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
