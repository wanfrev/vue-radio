import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),

  STREAM_URL: z.string().url(),
  STREAM_NAME: z.string().min(1).default('My Radio'),

  AUTODJ_API_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  AUTODJ_API_KEY: z.string().optional().or(z.literal('').transform(() => undefined)),
  AUTODJ_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),

  ITUNES_API_URL: z.string().url().default('https://itunes.apple.com/search'),
  ITUNES_CACHE_TTL_MS: z.coerce.number().int().positive().default(86_400_000),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  HISTORY_MAX_ITEMS: z.coerce.number().int().positive().default(20),

  DATABASE_PATH: z.string().default('./data/radio.db'),

  ADMIN_USERNAME: z.string().min(1).default('admin'),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(16),

  AZURACAST_BASE_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  AZURACAST_API_KEY: z.string().optional().or(z.literal('').transform(() => undefined)),
  AZURACAST_STATION_ID: z.coerce.number().int().positive().optional().or(z.literal('').transform(() => undefined)),
  AZURACAST_LIVE_DJ_MOUNTPOINT: z.string().optional().or(z.literal('').transform(() => undefined)),
  AZURACAST_LIVE_DJ_PASSWORD: z.string().optional().or(z.literal('').transform(() => undefined)),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const hasAutoDj = Boolean(env.AUTODJ_API_URL);
