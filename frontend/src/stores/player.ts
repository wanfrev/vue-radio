import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    isBuffering: false,
    volume: 0.8,
    muted: false,
    streamUrl: '' as string,
    stationName: 'Radio' as string,
    error: null as string | null,
    actionToken: 0,
  }),

  getters: {
    canPlay: (s) => s.streamUrl.length > 0,
  },

  actions: {
    setStream(url: string, name: string): void {
      this.streamUrl = url;
      this.stationName = name;
    },

    setPlaying(v: boolean): void { this.isPlaying = v; },
    setBuffering(v: boolean): void { this.isBuffering = v; },
    setError(e: string | null): void { this.error = e; },

    requestPlay(): void {
      this.actionToken = Date.now();
      this.error = null;
    },

    requestPause(): void {
      this.actionToken = Date.now();
    },

    refreshStream(): void {
      this.actionToken = Date.now();
      this.error = null;
    },

    setVolume(v: number): void {
      this.volume = Math.max(0, Math.min(1, v));
      if (this.volume > 0) this.muted = false;
    },

    setMuted(m: boolean): void { this.muted = m; },
  },
});