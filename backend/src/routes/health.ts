import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { metadata } from '../services/metadata.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    hasCurrent: metadata.getCurrent() !== null,
    historySize: metadata.getHistory().length,
    streamName: env.STREAM_NAME,
    timestamp: Date.now(),
  }));

  fastify.get('/ready', async (_req, reply) => {
    if (metadata.getCurrent() === null) {
      return reply.status(503).send({ status: 'warming-up' });
    }
    return { status: 'ready' };
  });
}
