import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../plugins/auth.js';
import { azuracast } from '../../services/azuracast.js';

export async function adminMusicRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', requireAuth);

  app.get('/files', async () => {
    const files = await azuracast.listFiles();
    return {
      files: files.map((f) => ({
        id: f.id,
        name: f.path.split('/').pop() || f.path,
        path: f.path,
        size: f.size,
        mtime: f.mtime,
      })),
    };
  });

  app.post('/upload', async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ error: 'No file uploaded' });

    const buffer = await data.toBuffer();
    const result = await azuracast.uploadFile(data.filename, buffer);
    if (!result) return reply.code(500).send({ error: 'Upload failed' });
    return { file: result };
  });

  app.delete('/file/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const ok = await azuracast.deleteFile(Number(id));
    if (!ok) return reply.code(500).send({ error: 'Delete failed' });
    return { ok: true };
  });

  app.get('/playlists', async () => {
    const playlists = await azuracast.listPlaylists();
    return { playlists };
  });

  app.post('/playlist/:id/add', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { media } = req.body as { media: number[] };
    const ok = await azuracast.addToPlaylist(Number(id), media);
    if (!ok) return reply.code(500).send({ error: 'Add to playlist failed' });
    return { ok: true };
  });

  app.post('/playlist/:id/remove', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { media } = req.body as { media: number[] };
    const ok = await azuracast.removeFromPlaylist(Number(id), media);
    if (!ok) return reply.code(500).send({ error: 'Remove from playlist failed' });
    return { ok: true };
  });
}
