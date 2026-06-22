import { defineStore } from 'pinia';

/**
 * The audio element is the *only* thing in the app that owns the actual
 * <audio> instance. The store just tracks the state that the UI needs to
 * reflect.
 *
 * IMPORTANT: never bind `src` reactively from this store to the <audio>
 * element. The stream URL is set once on mount, and only `play()` / `pause()`
 * and the `volume` are driven from here. Updating `src` would reload the
 * stream and cause an audible gap.
 */
export const usePlayerStore = defineStore('player', {
  state: () => ({
    isPlaying: false,
    isBuffering: false,
    volume: 0.8,
    muted: false,
    streamUrl: '' as string,
    stationName: 'Radio' as string,
    error: null as string | null,
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

    setVolume(v: number): void {
      this.volume = Math.max(0, Math.min(1, v));
      if (this.volume > 0) this.muted = false;
    },

    setMuted(m: boolean): void { this.muted = m; },
  },
});
