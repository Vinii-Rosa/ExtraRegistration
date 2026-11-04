import type { FastifyReply, FastifyRequest } from 'fastify';

type TokenUser = { user_id: string; email: string };
type RefreshPayload = TokenUser & { type?: 'refresh' };

export function signAccessToken(reply: FastifyReply, user: TokenUser) {
  return reply.jwtSign({ user_id: user.user_id, email: user.email }, { expiresIn: '15m' });
}

export function signRefreshToken(reply: FastifyReply, user: TokenUser) {
  return reply.jwtSign({ user_id: user.user_id, email: user.email, type: 'refresh' }, { expiresIn: '7d' });
}

export function setRefreshCookie(reply: FastifyReply, token: string) {
  return reply.setCookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearRefreshCookie(reply: FastifyReply) {
  return reply.clearCookie('refresh_token', { path: '/' });
}

export function verifyRefreshToken(req: FastifyRequest, token: string) {
  try {
    const payload = req.server.jwt.verify<RefreshPayload>(token);
    return payload.type === 'refresh' ? payload : null;
  } catch {
    return null;
  }
}
