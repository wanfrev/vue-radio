import axios from 'axios';
import FormData from 'form-data';
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

export interface AzuracastFile {
  id: number;
  path: string;
  name: string;
  size: number;
  mtime: number;
  art: string | null;
  custom_fields: string[];
  links: Record<string, string>;
}

export interface AzuracastPlaylist {
  id: number;
  name: string;
  short_name: string;
  type: string;
  is_enabled: boolean;
  links: Record<string, string>;
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

  async skipSong(): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(`/station/${env.AZURACAST_STATION_ID}/backend/skip`);
      return true;
    } catch (err) {
      console.warn('[azuracast] skipSong failed', (err as Error).message);
      return false;
    }
  },

  async stopAutodj(): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(`/station/${env.AZURACAST_STATION_ID}/backend/stop`);
      return true;
    } catch (err) {
      console.warn('[azuracast] stopAutodj failed', (err as Error).message);
      return false;
    }
  },

  async restartAutodj(): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(`/station/${env.AZURACAST_STATION_ID}/backend/restart`);
      return true;
    } catch (err) {
      console.warn('[azuracast] restartAutodj failed', (err as Error).message);
      return false;
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
    host: string;
    port: string;
    mountpoint: string;
    username: string;
    password: string;
    fullUrl: string;
  } | null {
    if (!hasConfig || !env.AZURACAST_LIVE_DJ_MOUNTPOINT) return null;
    const rawHost = env.AZURACAST_LIVE_DJ_HOST || env.AZURACAST_BASE_URL!.replace(/https?:\/\//, '').replace(/:.*/, '');
    const parts = rawHost.includes(':') ? rawHost.split(':') : [rawHost, '8000'];
    const host = parts[0]!;
    const port = parts[1]!;
    return {
      host,
      port,
      mountpoint: env.AZURACAST_LIVE_DJ_MOUNTPOINT!,
      username: 'source',
      password: env.AZURACAST_LIVE_DJ_PASSWORD || '',
      fullUrl: `${host}:${port}${env.AZURACAST_LIVE_DJ_MOUNTPOINT}`,
    };
  },

  async listFiles(): Promise<AzuracastFile[]> {
    if (!hasConfig) return [];
    try {
      const r = await client.get(`/station/${env.AZURACAST_STATION_ID}/files`);
      return (r.data as AzuracastFile[]) ?? [];
    } catch (err) {
      console.warn('[azuracast] listFiles failed', (err as Error).message);
      return [];
    }
  },

  async uploadFile(filename: string, buffer: Buffer): Promise<AzuracastFile | null> {
    if (!hasConfig) return null;
    try {
      const form = new FormData();
      form.append('file', buffer, { filename, contentType: 'audio/mpeg' });
      form.append('path', filename);
      const r = await client.post(`/station/${env.AZURACAST_STATION_ID}/files`, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      return (r.data as AzuracastFile) ?? null;
    } catch (err) {
      console.warn('[azuracast] uploadFile failed', (err as Error).message);
      return null;
    }
  },

  async deleteFile(id: number): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.delete(`/station/${env.AZURACAST_STATION_ID}/file/${id}`);
      return true;
    } catch (err) {
      console.warn('[azuracast] deleteFile failed', (err as Error).message);
      return false;
    }
  },

  async listPlaylists(): Promise<AzuracastPlaylist[]> {
    if (!hasConfig) return [];
    try {
      const r = await client.get(`/station/${env.AZURACAST_STATION_ID}/playlists`);
      return (r.data as AzuracastPlaylist[]) ?? [];
    } catch (err) {
      console.warn('[azuracast] listPlaylists failed', (err as Error).message);
      return [];
    }
  },

  async addToPlaylist(playlistId: number, mediaIds: number[]): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(
        `/station/${env.AZURACAST_STATION_ID}/playlist/${playlistId}/add`,
        { media: mediaIds },
      );
      return true;
    } catch (err) {
      console.warn('[azuracast] addToPlaylist failed', (err as Error).message);
      return false;
    }
  },

  async removeFromPlaylist(playlistId: number, mediaIds: number[]): Promise<boolean> {
    if (!hasConfig) return false;
    try {
      await client.post(
        `/station/${env.AZURACAST_STATION_ID}/playlist/${playlistId}/remove`,
        { media: mediaIds },
      );
      return true;
    } catch (err) {
      console.warn('[azuracast] removeFromPlaylist failed', (err as Error).message);
      return false;
    }
  },
};