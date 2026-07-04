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

  app.post('/skip', async (_req, reply) => {
    const ok = await liveState.skip();
    if (ok) return { ok: true };
    if (!liveState.isAvailable) {
      return reply.code(400).send({ error: 'Azuracast not configured' });
    }
    return reply.code(500).send({ error: 'Failed to skip song' });
  });

  app.post('/stop-autodj', async (_req, reply) => {
    const ok = await liveState.stopAutodj();
    if (ok) return { ok: true };
    if (!liveState.isAvailable) {
      return reply.code(400).send({ error: 'Azuracast not configured' });
    }
    return reply.code(500).send({ error: 'Failed to stop AutoDJ' });
  });

  app.post('/restart-autodj', async (_req, reply) => {
    const ok = await liveState.restartAutodj();
    if (ok) return { ok: true };
    if (!liveState.isAvailable) {
      return reply.code(400).send({ error: 'Azuracast not configured' });
    }
    return reply.code(500).send({ error: 'Failed to restart AutoDJ' });
  });

  app.post('/disconnect', async (_req, reply) => {
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
      username: creds.username,
      password: creds.password,
      fullUrl: creds.fullUrl,
    };
  });
}