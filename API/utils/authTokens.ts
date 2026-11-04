import type { FastifyReply } from 'fastify';

type TokenUser = { user_id: string; email: string };

export const signAccessToken = (reply: FastifyReply, user: TokenUser) =>
  reply.jwtSign({ user_id: user.user_id, email: user.email }, { expiresIn: '15m' });

export const signRefreshToken = (reply: FastifyReply, user: TokenUser) =>
  reply.jwtSign({ user_id: user.user_id, email: user.email, type: 'refresh' }, { expiresIn: '7d' });

export const setRefreshCookie = (reply: FastifyReply, token: string) =>
  reply.setCookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

export const clearRefreshCookie = (reply: FastifyReply) =>
  reply.clearCookie('refresh_token', { path: '/' });
