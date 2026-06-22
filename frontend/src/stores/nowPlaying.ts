import { defineStore } from 'pinia';
import type { HistoryItem, NowPlaying } from '@/services/api';

interface State {
  current: NowPlaying | null;
  history: HistoryItem[];
  connection: 'idle' | 'connecting' | 'open' | 'error';
}

export const useNowPlayingStore = defineStore('now-playing', {
  state: (): State => ({
    current: null,
    history: [],
    connection: 'idle',
  }),

  getters: {
    hasArt: (s) => Boolean(s.current?.art),
    artUrl: (s) => s.current?.art ?? null,
  },

  actions: {
    setCurrent(np: NowPlaying | null): void {
      this.current = np;
    },

    setHistory(items: HistoryItem[]): void {
      this.history = items;
    },

    setConnection(s: State['connection']): void {
      this.connection = s;
    },

    prependHistory(item: HistoryItem): void {
      this.history = [item, ...this.history].slice(0, 20);
    },

    setLive(data: { isLive: boolean; liveStreamerName: string | null }): void {
      if (this.current) {
        this.current.isLive = data.isLive;
        this.current.liveStreamerName = data.liveStreamerName;
      }
    },
  },
});
