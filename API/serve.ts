import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import db from './db.js';
import { JWT_SECRET } from './config/jwt.js';
import './models/index.js';
import UsersRoutes from './routes/users.js';
import LoginRoutes from './routes/login.js';
import ProjectsRoutes from './routes/projects.js';
import ExtraHoursRoutes from './routes/extra_hours.js';
import MonthlyTotalsRoutes from './routes/monthly_totals.js';

export const app = Fastify({ logger: true });
const basePort = Number(process.env.PORT) || 3001;
const maxPortAttempts = 20;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Configure no arquivo .env');
}

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

await app.register(cookie);
await app.register(cors, {
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});
await app.register(jwt, { secret: JWT_SECRET });

await app.register(LoginRoutes, { prefix: '/login' });
await app.register(UsersRoutes, { prefix: '/users' });
await app.register(ProjectsRoutes, { prefix: '/projects' });
await app.register(ExtraHoursRoutes, { prefix: '/extra-hours' });
await app.register(MonthlyTotalsRoutes, { prefix: '/monthly-totals' });

await db.authenticate();

async function listenOnFreePort() {
  for (let port = basePort; port < basePort + maxPortAttempts; port++) {
    try {
      await app.listen({ port, host: '0.0.0.0' });
      return port;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw error;
      app.log.warn(`Porta ${port} em uso, tentando ${port + 1}`);
    }
  }
  throw new Error(`Nenhuma porta livre entre ${basePort} e ${basePort + maxPortAttempts - 1}`);
}

const port = await listenOnFreePort();
console.log(`App listening on port ${port}`);
