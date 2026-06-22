import axios from 'axios';
import { z } from 'zod';
import { env } from '../config/env.js';
import { TtlCache } from './cache.js';

const ItunesResponseSchema = z.object({
  resultCount: z.number(),
  results: z.array(
    z.object({
      artworkUrl100: z.string().optional(),
      artworkUrl60: z.string().optional(),
    }).passthrough()
  ),
});

type CoverEntry = { url: string; source: 'itunes' | 'autodj' };

/**
 * Resolves cover art for a track. Resolution order:
 *   1. Caller-supplied URL (e.g. from AutoDJ) — trusted, not cached.
 *   2. iTunes Search API lookup by `${artist} ${title}` — cached.
 *
 * iTunes artwork is served as 100x100 by default; we rewrite the URL to 600x600
 * for the player UI.
 */
class CoverArtService {
  private cache = new TtlCache<CoverEntry>(env.ITUNES_CACHE_TTL_MS);

  async resolve(opts: {
    artist: string;
    title: string;
    providedUrl?: string | null;
  }): Promise<string | null> {
    if (opts.providedUrl) return opts.providedUrl;

    const key = this.cacheKey(opts.artist, opts.title);
    const cached = this.cache.get(key);
    if (cached) return cached.url;

    try {
      const res = await axios.get(env.ITUNES_API_URL, {
        params: {
          term: `${opts.artist} ${opts.title}`.trim(),
          media: 'music',
          entity: 'song',
          limit: 1,
        },
        timeout: 3500,
      });
      const parsed = ItunesResponseSchema.safeParse(res.data);
      if (!parsed.success || parsed.data.resultCount === 0) return null;
      const first = parsed.data.results[0];
      const raw =
        first?.artworkUrl100 ??
        first?.artworkUrl60 ??
        null;
      if (!raw) return null;
      const highRes = raw.replace('100x100bb', '600x600bb').replace('60x60bb', '600x600bb');
      this.cache.set(key, { url: highRes, source: 'itunes' });
      return highRes;
    } catch (err) {
      console.warn('[cover] iTunes lookup failed', (err as Error).message);
      return null;
    }
  }

  private cacheKey(artist: string, title: string): string {
    return `${artist.toLowerCase().trim()}|${title.toLowerCase().trim()}`;
  }
}

export const coverArt = new CoverArtService();
