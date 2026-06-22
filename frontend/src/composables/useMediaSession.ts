import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

/**
 * Bridges the persistent `<audio>` element to the `player` store and wires up
 * the Media Session API so the OS (mobile lock screen, OS media keys,
 * Bluetooth headsets, CarPlay) shows the right metadata and play/pause state.
 *
 * The audio element lives in `AudioCore.vue`. This composable is the only
 * place that talks to it; components elsewhere mutate the store and react.
 *
 * Pass the `ref` itself (not its value) — the element is null on the first
 * synchronous tick and only becomes available after mount.
 */
export function useMediaSession(audioRef: Ref<HTMLAudioElement | null>): {
  tryPlay: () => void;
  pause:   () => void;
  toggle:  () => void;
} {
  const player = usePlayerStore();
  const np = useNowPlayingStore();

  function getAudio(): HTMLAudioElement | null {
    return audioRef.value;
  }

  function tryPlay(): void {
    const a = getAudio();
    if (!a) return;
    a.play().catch((err: unknown) => {
      // Autoplay restrictions land here until the user clicks Play.
      const msg = err instanceof Error ? err.message : 'Playback blocked';
      player.setError(msg);
      player.setPlaying(false);
    });
  }

  function pause(): void {
    getAudio()?.pause();
  }

  function toggle(): void {
    const a = getAudio();
    if (!a) return;
    if (a.paused) tryPlay(); else pause();
  }

  // --- Media Session (lock screen / OS controls) ---
  function updateMetadata(): void {
    if (!('mediaSession' in navigator) || !np.current) return;
    const artwork = np.current.art
      ? [{ src: np.current.art, sizes: '512x512', type: 'image/jpeg' }]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: np.current.title,
      artist: np.current.artist,
      album: np.current.album ?? '',
      artwork,
    });
  }

  function bindMediaSession(): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',  tryPlay);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('seekbackward', null);
    navigator.mediaSession.setActionHandler('seekforward', null);
  }

  // --- Lifecycle ---
  onMounted(() => {
    const a = getAudio();
    if (!a) return;
    a.volume = player.volume;
    a.muted  = player.muted;

    a.addEventListener('play',     () => player.setPlaying(true));
    a.addEventListener('pause',    () => player.setPlaying(false));
    a.addEventListener('waiting',  () => player.setBuffering(true));
    a.addEventListener('playing',  () => player.setBuffering(false));
    a.addEventListener('canplay',  () => player.setBuffering(false));
    a.addEventListener('error',    () => {
      player.setError('Stream error');
      player.setPlaying(false);
    });

    bindMediaSession();
  });

  onBeforeUnmount(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',  null);
    navigator.mediaSession.setActionHandler('pause', null);
  });

  // --- Reactive bridges ---
  watch(() => player.volume, (v) => { const a = getAudio(); if (a) a.volume = v; });
  watch(() => player.muted,  (m) => { const a = getAudio(); if (a) a.muted  = m; });
  watch(() => np.current, () => updateMetadata(), { deep: true });
  watch(() => player.isPlaying, (p) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = p ? 'playing' : 'paused';
    }
  });

  return { tryPlay, pause, toggle };
}
