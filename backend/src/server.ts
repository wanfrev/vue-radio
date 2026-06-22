import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import sensible from '@fastify/sensible';
import { env, isDev, isProd } from './config/env.js';
import { radioRoutes } from './routes/radio.js';
import { healthRoutes } from './routes/health.js';
import { donationsRoutes } from './routes/donations.js';
import { authRoutes } from './routes/auth.js';
import { adminDonationsRoutes } from './routes/admin/donations.js';
import { adminLiveRoutes } from './routes/admin/live.js';
import { registerAuthPlugin } from './plugins/auth.js';
import { metadata } from './services/metadata.js';
import { initDb, closeDb } from './db/index.js';

async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isDev
      ? { level: env.LOG_LEVEL, transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } } }
      : { level: env.LOG_LEVEL },
    disableRequestLogging: isProd,
    trustProxy: true,
  });

  await app.register(sensible);

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGINS.includes('*')) return cb(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed`), false);
    },
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  await app.register(registerAuthPlugin);

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    allowList: (req) => req.url === '/health' || req.url === '/ready',
  });

  await app.register(healthRoutes);
  await app.register(radioRoutes, { prefix: '/api' });
  await app.register(donationsRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(adminDonationsRoutes, { prefix: '/api/admin/donations' });
  await app.register(adminLiveRoutes, { prefix: '/api/admin/live' });

  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, 'Unhandled error');
    if (reply.sent) return;
    const statusCode = err.statusCode ?? 500;
    reply.status(statusCode).send({
      error: err.name,
      message: isProd ? 'Internal Server Error' : err.message,
    });
  });

  return app;
}

async function start(): Promise<void> {
  initDb();

  const app = await buildServer();

  metadata.start();

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'Shutting down');
    metadata.stop();
    closeDb();
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    app.log.error({ err }, 'Unhandled promise rejection');
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 Radio backend listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

void start();
