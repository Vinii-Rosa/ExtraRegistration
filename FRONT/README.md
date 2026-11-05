# Extra Hour — front-end

Interface do Extra Hour, feita com Next.js 16, React 19, TypeScript e Tailwind 4. Ela consome a API de `../API`.

## Telas

| Rota | Conteúdo |
|---|---|
| `/login`, `/cadastro` | Entrar e criar conta. Depois do cadastro o login é automático |
| `/extras` | Lista de horas extras com filtros (data, mês, hora, valor), paginação, itens por página, total do mês, criar, editar, fechar, reabrir, excluir e exportar planilha |
| `/projetos` | Projetos com filtro local, criar, editar, excluir e recálculo dos extras ao mudar o valor/hora |

## Como rodar

Pré-requisitos: Node 24 e a API no ar (`../API/api_up.sh`, que sobe a API e o banco no Docker).

```bash
cp .env.example .env.local   # ajuste API_URL se a API não estiver na porta 3001
npm install
npm run dev
```

O app abre em http://localhost:3000.

| Variável | Onde | Descrição |
|---|---|---|
| `API_URL` | `.env.local` | URL da API. Só o servidor do Next a lê; o navegador nunca fala direto com a API |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm test` | Testes Jest |
| `npm run test:w` | Testes em modo watch |

O CI (`.github/workflows/front-ci.yml`) roda lint, tipos, build e testes a cada mudança em `FRONT/`.

## Arquitetura

### Autenticação

O Next fica entre o navegador e a API. As Server Actions e os Route Handlers chamam a API, e os tokens ficam em cookies `httpOnly` no domínio do front (`access_token` por 15 min, `refresh_token` por 7 dias). Por isso a API não precisa de CORS para este front.

- `src/proxy.ts` renova o access token quando ele falta ou está a menos de 30 s de expirar. Sem refresh válido, limpa os cookies e redireciona para `/login`.
- `src/lib/authed.ts` envolve cada Server Action: valida a sessão, e em 401 faz um refresh e repete uma vez.
- O `user_id` e o email vêm do payload do JWT (`src/lib/tokens.ts`). O front não conhece o `JWT_SECRET` e não verifica a assinatura; quem confia no token é a API.

### Acesso à API

Todas as chamadas ficam em `src/lib/routes/*`, em cima do cliente de `src/lib/api.ts` (Bearer, erro `{ message }` vira `ApiError`). As datas são convertidas na borda: os inputs usam `YYYY-MM-DD` e a API espera `DD/MM/YYYY`.

### Cache

`cacheComponents: true`. As leituras em `src/lib/data/*` usam `'use cache'` com `cacheLife` e `cacheTag`.

- O token entra como argumento da função e, portanto, na chave do cache: só quem tem aquele token acerta a entrada, sem vazar dados entre usuários. O cache dura no máximo 15 min, o tempo de vida do token.
- Listagem de extras só entra no cache com `page`, `limit` e `month`. Filtros por `date`, `hour` ou `total_value` não são cacheados.
- Escritas invalidam com `updateTag`, conforme o mapa em `src/lib/cache-tags.ts`:

| Escrita | Tags invalidadas |
|---|---|
| Criar, editar, fechar, reabrir ou excluir extra | `extras`, `monthly`, `projects` |
| Criar, editar ou excluir projeto | `projects` |
| Recalcular | `extras`, `monthly`, `projects` |

- Erro de escrita não invalida nada. As tags são por usuário (`projects:<user_id>`).
- O cache padrão fica em memória, então ele funciona em Node ou Docker. Em serverless as entradas quase não seriam reaproveitadas.
- Em `npm run dev` o cache se comporta diferente. Para medir o comportamento real, use `npm run build && npm start`.

### Estado

`useContext` no lugar de props em cascata: `ThemeContext` e `ToastContext` na raiz; `SessionContext`, `SidebarContext` e `ProjectsContext` no layout `(app)`; `ExtrasPageContext` e `ProjectsPageContext` nas telas. Filtros e página de extras ficam na URL, então o botão voltar funciona.

### Estrutura

```
src/
  app/          rotas: (auth)/login, (auth)/cadastro, (app)/extras, (app)/projetos,
                api/extra-hours/export
  proxy.ts      renovação de sessão e redirecionamentos
  actions/      Server Actions (auth, projects, extra-hours)
  lib/          api, authed, session, tokens, format, cache-tags, extras-query,
                routes/ (chamadas à API), data/ (leituras com cache)
  contexts/     providers do useContext
  components/   ui/, shell/, auth/, projects/, extra-hours/
  types/
test/           testes Jest (*-test.ts)
```

### Design

Medidas, tipografia e efeito da sidebar seguem o padrão de front do projeto. Os tokens semânticos ficam em `src/app/globals.css` e trocam com `data-theme` (light e dark). O tema e a sidebar guardam a escolha em `localStorage`, aplicada por um script inline antes da hidratação, sem piscar.

## Testes

Jest com `next/jest`, em `test/*-test.ts`. Cobrem o que não depende de rede nem do runtime do Next:

- `format-test.ts`: moeda (`null` é "Em aberto", nunca R$ 0), datas, horas, fuso de São Paulo e mês.
- `conversions-test.ts`: conversão de data na borda com a API e leitura dos filtros da URL.
- `tokens-test.ts`: leitura do `refresh_token` nos `Set-Cookie`, payload do JWT e janela de renovação de 30 s.
- `cache-tags-test.ts`: mapa de invalidação por tipo de escrita.
