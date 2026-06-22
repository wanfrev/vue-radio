import { TtlCache } from './cache.js';
import { azuracast, type LiveStatus } from './azuracast.js';

interface CachedLiveState {
  isLive: boolean;
  streamerName: string | null;
  lastChecked: number;
}

class LiveStateService {
  private cache = new TtlCache<CachedLiveState>(8_000);

  async getStatus(): Promise<CachedLiveState> {
    const cached = this.cache.get('live-status');
    if (cached) return cached;

    const status = await azuracast.liveStatus();
    if (!status) {
      // No Azuracast config or request failed — return cached or false
      return cached ?? { isLive: false, streamerName: null, lastChecked: 0 };
    }

    const entry: CachedLiveState = {
      isLive: status.isLive,
      streamerName: status.streamerName,
      lastChecked: Date.now(),
    };
    this.cache.set('live-status', entry);
    return entry;
  }

  async disconnect(): Promise<boolean> {
    const ok = await azuracast.disconnectLiveDj();
    if (ok) this.cache.delete('live-status');
    return ok;
  }

  credentials() {
    return azuracast.liveDjCredentials();
  }

  get isAvailable(): boolean {
    return azuracast.ready;
  }
}

export const liveState = new LiveStateService();
