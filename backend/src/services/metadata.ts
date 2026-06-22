import { EventEmitter } from 'node:events';
import { env } from '../config/env.js';
import { autodj } from './autodj.js';
import { coverArt } from './coverArt.js';
import { liveState } from './liveState.js';
import { type NowPlaying, type HistoryItem } from '../schemas/autodj.js';

/**
 * Owns the in-memory model of "what is the radio doing right now". The poller
 * ticks at `AUTODJ_POLL_INTERVAL_MS`, normalizes the response, resolves the
 * cover art and pushes a `change` event only when the song actually changes
 * (i.e. id OR title+artist differ from the last known state).
 *
 * Additionally emits `live-change` when isLive or streamerName changes,
 * independently of song changes.
 *
 * Subscribers (the SSE route) listen to `change` and `live-change` for
 * efficient fan-out.
 */
class MetadataService extends EventEmitter {
  private current: NowPlaying | null = null;
  private history: HistoryItem[] = [];
  private timer: NodeJS.Timeout | null = null;
  private lastSongKey: string | null = null;
  private lastLiveKey: string | null = null;
  private readonly maxHistory: number;

  constructor() {
    super();
    this.setMaxListeners(0);
    this.maxHistory = env.HISTORY_MAX_ITEMS;
  }

  start(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), env.AUTODJ_POLL_INTERVAL_MS);
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getCurrent(): NowPlaying | null {
    return this.current;
  }

  getHistory(): HistoryItem[] {
    return [...this.history];
  }

  private async tick(): Promise<void> {
    const raw = await autodj.fetchNowPlaying();
    const art = await coverArt.resolve({
      artist: raw.artist,
      title: raw.title,
      providedUrl: raw.art,
    });

    // Enrich with live status from Azuracast (if available)
    let isLive = raw.isLive;
    let liveStreamerName: string | null = null;
    if (liveState.isAvailable) {
      const status = await liveState.getStatus();
      isLive = status.isLive;
      liveStreamerName = status.streamerName;
    }

    const next: NowPlaying = { ...raw, art, isLive, liveStreamerName };
    const songKey = this.songKey(next);
    const liveKey = `${next.isLive}::${next.liveStreamerName ?? ''}`;

    // Emit live-change when live state changes (even if song is the same)
    if (liveKey !== this.lastLiveKey) {
      this.lastLiveKey = liveKey;
      this.emit('live-change', {
        isLive: next.isLive,
        liveStreamerName: next.liveStreamerName,
      });
    }

    if (songKey !== this.lastSongKey) {
      if (this.current) {
        const ended: HistoryItem = { ...this.current, endedAt: Date.now() };
        this.history = [ended, ...this.history].slice(0, this.maxHistory);
      }
      this.lastSongKey = songKey;
      this.current = next;
      this.emit('change', next);
    } else {
      this.current = next;
    }
  }

  private songKey(np: NowPlaying): string {
    if (np.songId) return np.songId;
    return `${np.artist}::${np.title}`.toLowerCase();
  }
}

export const metadata = new MetadataService();
