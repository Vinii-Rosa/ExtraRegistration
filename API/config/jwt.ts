export const JWT_SECRET = process.env.JWT_SECRET;

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { user_id: string; email: string; type?: 'refresh' };
    user: { user_id: string; email: string; type?: 'refresh' };
  }
}
