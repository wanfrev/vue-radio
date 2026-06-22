import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifySession } from '../services/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: { sub: string; role: string } | null;
  }
}

export async function registerAuthPlugin(app: FastifyInstance): Promise<void> {
  app.decorateRequest('user', null);
}

export async function requireAuth(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = req.cookies['radio_session'];
  if (!token) {
    await reply.code(401).send({ error: 'Not authenticated' });
    return;
  }
  const session = verifySession(token);
  if (!session) {
    await reply.code(401).send({ error: 'Invalid or expired session' });
    return;
  }
  req.user = session;
}
