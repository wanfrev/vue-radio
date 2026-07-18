/**
 * Thin fetch wrapper. The `base` is `import.meta.env.VITE_API_BASE` if set,
 * otherwise empty (Vite dev server proxies `/api/*` to the backend).
 */
const base = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { error?: string; message?: string };
      detail = j.error ?? j.message ?? detail;
    } catch {
      // ignore body parse failure
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export interface NowPlaying {
  title: string;
  artist: string;
  album: string | null;
  art: string | null;
  elapsed: number | null;
  duration: number | null;
  isLive: boolean;
  liveStreamerName: string | null;
  listeners: number;
  startedAt: number;
}

export interface HistoryItem extends Omit<NowPlaying, never> {
  endedAt: number;
}

export interface StreamInfo {
  url: string;
  name: string;
}

export interface DonationAccount {
  id: number;
  bankName: string;
  accountHolder: string;
  clabe: string;
  accountNumber: string;
  accountType: 'ahorro' | 'cheques';
  notes: string;
  sortOrder: number;
  active: boolean;
}

export const api = {
  nowPlaying: () => request<NowPlaying>('/api/now-playing'),
  history:    () => request<{ items: HistoryItem[] }>('/api/history'),
  streamUrl:  () => request<StreamInfo>('/api/stream-url'),

  /**
   * Open the SSE stream. Returns a typed `EventSource` plus cleanup.
   */
  openStream(onSnapshot: (np: NowPlaying | null) => void,
             onChange:    (np: NowPlaying) => void,
             onError?:    (ev: Event) => void,
             onLiveChange?: (data: { isLive: boolean; liveStreamerName: string | null }) => void): () => void {
    const es = new EventSource(`${base}/api/stream`, { withCredentials: false });

    es.addEventListener('snapshot', (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as NowPlaying | { empty: true };
        onSnapshot('empty' in data ? null : data);
      } catch (e) {
        console.warn('[sse] snapshot parse failed', e);
      }
    });

    es.addEventListener('change', (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as NowPlaying;
        onChange(data);
      } catch (e) {
        console.warn('[sse] change parse failed', e);
      }
    });

    es.addEventListener('live-change', (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { isLive: boolean; liveStreamerName: string | null };
        onLiveChange?.(data);
      } catch (e) {
        console.warn('[sse] live-change parse failed', e);
      }
    });

    es.addEventListener('error', (ev) => {
      onError?.(ev);
    });

    return () => es.close();
  },
};
