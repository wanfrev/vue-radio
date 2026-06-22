import type { FastifyInstance } from 'fastify';
import { LoginBodySchema } from '../schemas/auth.js';
import { signSession, verifyPassword } from '../services/auth.js';
import { requireAuth } from '../plugins/auth.js';
import { env, isProd } from '../config/env.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/login', async (req, reply) => {
    const parsed = LoginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid credentials format' });
    }
    const { username, password } = parsed.data;

    if (username !== env.ADMIN_USERNAME || !verifyPassword(password)) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = signSession(username);
    reply.setCookie('radio_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 86400, // 24 hours
    });

    return { ok: true, username };
  });

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie('radio_session', { path: '/' });
    return { ok: true };
  });

  app.get(
    '/me',
    { preHandler: [requireAuth] },
    async (req, reply) => {
      if (!req.user) {
        return reply.code(401).send({ error: 'Not authenticated' });
      }
      return { username: req.user.sub, role: req.user.role };
    },
  );
}
