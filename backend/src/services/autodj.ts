import axios, { AxiosError } from 'axios';
import { env, hasAutoDj } from '../config/env.js';
import { RawAutoDjResponseSchema, type RawAutoDjResponse, type NowPlaying } from '../schemas/autodj.js';

/**
 * A small, defensive client around the AutoDJ. If `AUTODJ_API_URL` is not set or
 * the request fails, we return a deterministic mock so the rest of the system
 * can be developed and demoed without external infra.
 */
class AutoDjClient {
  private consecutiveFailures = 0;

  async fetchNowPlaying(): Promise<NowPlaying> {
    if (!hasAutoDj) {
      return this.mock();
    }
    try {
      const res = await axios.get<RawAutoDjResponse>(env.AUTODJ_API_URL!, {
        timeout: 4000,
        headers: env.AUTODJ_API_KEY
          ? { Authorization: `Bearer ${env.AUTODJ_API_KEY}` }
          : undefined,
        validateStatus: (s) => s >= 200 && s < 300,
      });
      const parsed = RawAutoDjResponseSchema.safeParse(res.data);
      if (!parsed.success) {
        console.warn('[autodj] Response failed validation, falling back to mock');
        return this.mock();
      }
      this.consecutiveFailures = 0;
      return this.normalize(parsed.data);
    } catch (err) {
      this.consecutiveFailures += 1;
      if (err instanceof AxiosError) {
        console.warn(`[autodj] request failed (${this.consecutiveFailures}x): ${err.message}`);
      } else {
        console.warn('[autodj] unexpected error', err);
      }
      return this.mock();
    }
  }

  private normalize(raw: RawAutoDjResponse): NowPlaying {
    const song = raw.now_playing?.song ?? {};
    const id = song.id !== undefined ? String(song.id) : null;
    return {
      songId: id,
      title: song.title?.trim() || 'Unknown title',
      artist: song.artist?.trim() || 'Unknown artist',
      album: song.album?.trim() || null,
      art: song.art ?? null,
      elapsed: raw.now_playing?.elapsed ?? null,
      duration: raw.now_playing?.duration ?? null,
      isLive: raw.now_playing?.is_live ?? false,
      liveStreamerName: raw.now_playing?.streamer_username ?? null,
      listeners: raw.listeners?.current ?? 0,
      startedAt: Date.now(),
    };
  }

  private mock(): NowPlaying {
    const fixtures: NowPlaying[] = [
      {
        songId: 'mock-1',
        title: 'Cosmic Drift',
        artist: 'Solar Fields',
        album: 'Movements',
        art: null,
        elapsed: 42,
        duration: 384,
        isLive: false,
        liveStreamerName: null,
        listeners: 137,
        startedAt: Date.now(),
      },
      {
        songId: 'mock-2',
        title: 'Teardrop',
        artist: 'Massive Attack',
        album: 'Mezzanine',
        art: null,
        elapsed: 11,
        duration: 330,
        isLive: false,
        liveStreamerName: null,
        listeners: 142,
        startedAt: Date.now(),
      },
      {
        songId: 'mock-3',
        title: 'Windowlicker',
        artist: 'Aphex Twin',
        album: 'Windowlicker EP',
        art: null,
        elapsed: 0,
        duration: 372,
        isLive: false,
        liveStreamerName: null,
        listeners: 138,
        startedAt: Date.now(),
      },
    ];
    const pick = fixtures[Math.floor(Math.random() * fixtures.length)]!;
    return { ...pick, startedAt: Date.now(), listeners: 120 + Math.floor(Math.random() * 40) };
  }
}

export const autodj = new AutoDjClient();
