import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { metadata } from '../services/metadata.js';
import type { NowPlaying } from '../schemas/autodj.js';

export function shape(np: NowPlaying): Record<string, unknown> {
  return {
    title: np.title,
    artist: np.artist,
    album: np.album,
    art: np.art,
    elapsed: np.elapsed,
    duration: np.duration,
    isLive: np.isLive,
    liveStreamerName: np.liveStreamerName,
    listeners: np.listeners,
    startedAt: np.startedAt,
  };
}

export async function radioRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * Snapshot of the current song. Cheap to call (in-memory), but it does NOT
   * push updates — use `/api/stream` (SSE) for that.
   */
  fastify.get('/now-playing', async (_req, reply) => {
    const current = metadata.getCurrent();
    if (!current) {
      return reply.status(503).send({ error: 'Metadata not yet available' });
    }
    return shape(current);
  });

  /**
   * Last N songs, newest first. Length is bounded by HISTORY_MAX_ITEMS.
   */
  fastify.get('/history', async () => {
    return {
      items: metadata.getHistory().map((h) => ({
        ...h,
        // Don't leak internal state ids to clients.
        songId: null,
      })),
    };
  });

  /**
   * The public stream URL. Returned separately so the frontend can swap it
   * out (multi-mount, fallback, etc.) without re-parsing metadata.
   */
  fastify.get('/stream-url', async () => ({
    url: env.STREAM_URL,
    name: env.STREAM_NAME,
  }));

  /**
   * Server-Sent Events. Each subscriber receives an immediate `snapshot`
   * event with the current state, then `change` events on every song change.
   * Heartbeats keep proxies and browsers from dropping the connection.
   */
  fastify.get('/stream', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const send = (event: string, data: unknown): void => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const current = metadata.getCurrent();
    if (current) send('snapshot', shape(current));
    else send('snapshot', { empty: true });

    const onChange = (np: NowPlaying): void => send('change', shape(np));
    const onLiveChange = (data: { isLive: boolean; liveStreamerName: string | null }): void =>
      send('live-change', data);
    metadata.on('change', onChange);
    metadata.on('live-change', onLiveChange);

    const heartbeat = setInterval(() => {
      reply.raw.write(': ping\n\n');
    }, 25_000);
    if (typeof heartbeat.unref === 'function') heartbeat.unref();

    req.raw.on('close', () => {
      clearInterval(heartbeat);
      metadata.off('change', onChange);
      metadata.off('live-change', onLiveChange);
      try {
        reply.raw.end();
      } catch {
        // already closed
      }
    });
  });
}
