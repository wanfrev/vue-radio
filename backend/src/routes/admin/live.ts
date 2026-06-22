import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../plugins/auth.js';
import { liveState } from '../../services/liveState.js';

export async function adminLiveRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', requireAuth);

  app.get('/status', async () => {
    const status = await liveState.getStatus();
    return {
      isLive: status.isLive,
      streamerName: status.streamerName,
      lastChecked: status.lastChecked,
      azuracastAvailable: liveState.isAvailable,
    };
  });

  app.post('/disconnect', async (req, reply) => {
    const ok = await liveState.disconnect();
    if (ok) return { ok: true };
    if (!liveState.isAvailable) {
      return reply.code(400).send({ error: 'Azuracast not configured' });
    }
    return reply.code(500).send({ error: 'Failed to disconnect live DJ' });
  });

  app.get('/credentials', async (_req, reply) => {
    const creds = liveState.credentials();
    if (!creds) {
      return reply.code(400).send({ error: 'Azuracast live DJ not configured' });
    }
    return {
      mountpoint: creds.mountpoint,
      password: creds.password,
      fullUrl: creds.fullUrl,
    };
  });
}
