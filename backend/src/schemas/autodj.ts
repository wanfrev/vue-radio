import { z } from 'zod';

/**
 * AutoDJ response shape. We keep this flexible because every panel is different
 * (Azuracast, Icecast JSON, Shoutcast2, Liquidsoap telnet, custom REST, etc.).
 *
 * The fields we care about are normalized in `metadata.ts`; this schema is just
 * a permissive validation of the *raw* response so the rest of the code can
 * trust the data.
 */
export const RawAutoDjResponseSchema = z
  .object({
    now_playing: z
      .object({
        song: z
          .object({
            id: z.union([z.string(), z.number()]).optional(),
            title: z.string().optional(),
            artist: z.string().optional(),
            album: z.string().optional(),
            art: z.string().url().optional(),
          })
          .partial()
          .optional(),
        elapsed: z.number().optional(),
        duration: z.number().optional(),
        is_live: z.boolean().optional().default(false),
        streamer_username: z.string().optional(),
      })
      .partial()
      .optional(),
    listeners: z
      .object({
        current: z.number().int().nonnegative().optional(),
        total: z.number().int().nonnegative().optional(),
        unique: z.number().int().nonnegative().optional(),
      })
      .partial()
      .optional(),
    station: z
      .object({
        name: z.string().optional(),
        listen_url: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();

export type RawAutoDjResponse = z.infer<typeof RawAutoDjResponseSchema>;

/**
 * Normalized "now playing" record. This is what the rest of the app speaks.
 */
export const NowPlayingSchema = z.object({
  songId: z.string().nullable(),
  title: z.string(),
  artist: z.string(),
  album: z.string().nullable(),
  art: z.string().nullable(),
  elapsed: z.number().nullable(),
  duration: z.number().nullable(),
  isLive: z.boolean(),
  liveStreamerName: z.string().nullable(),
  listeners: z.number().int().nonnegative(),
  startedAt: z.number(),
});

export type NowPlaying = z.infer<typeof NowPlayingSchema>;

export const HistoryItemSchema = NowPlayingSchema.extend({
  endedAt: z.number(),
});

export type HistoryItem = z.infer<typeof HistoryItemSchema>;
