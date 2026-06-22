import axios from 'axios';
import { env } from '../config/env.js';

const hasConfig = !!env.AZURACAST_BASE_URL && !!env.AZURACAST_API_KEY;

const client = axios.create({
  baseURL: hasConfig
    ? `${env.AZURACAST_BASE_URL!.replace(/\/+$/, '')}/api`
    : 'http://localhost:9999',
  headers: hasConfig
    ? { 'X-API-Key': env.AZURACAST_API_KEY! }
    : undefined,
  timeout: 5000,
});

export interface LiveStatus {
  isLive: boolean;
  streamerName: string | null;
}

export const azuracast = {
  ready: hasConfig,

  async liveStatus(): Promise<LiveStatus | null> {
    if (!hasConfig) return null;
    try {
      const r = await client.get(`/station/${env.AZURACAST_STATION_ID}/nowplaying`);
      const data = Array.isArray(r.data) ? r.data[0] : r.data;
      return {
        isLive: data?.now_playing?.is_live === true,
        streamerName: data?.now_playing?.streamer_username ?? null,
      };
    } catch (err) {
      console.warn('[azuracast] liveStatus failed', (err as Error).message);
      return null;
    }
  },

  async disconnectLiveDj(): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(`/station/${env.AZURACAST_STATION_ID}/disconnect`);
      return true;
    } catch (err) {
      console.warn('[azuracast] disconnect failed', (err as Error).message);
      return false;
    }
  },

  liveDjCredentials(): {
    mountpoint: string;
    password: string;
    fullUrl: string;
  } | null {
    if (!hasConfig || !env.AZURACAST_LIVE_DJ_MOUNTPOINT) return null;
    const base = env.AZURACAST_BASE_URL!.replace(/\/+$/, '');
    return {
      mountpoint: env.AZURACAST_LIVE_DJ_MOUNTPOINT!,
      password: env.AZURACAST_LIVE_DJ_PASSWORD!,
      fullUrl: `${base}${env.AZURACAST_LIVE_DJ_MOUNTPOINT}`,
    };
  },
};
