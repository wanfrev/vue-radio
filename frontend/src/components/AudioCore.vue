<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const audio = ref<HTMLAudioElement | null>(null);
const player = usePlayerStore();
const np = useNowPlayingStore();

let lastToken = 0;

watch(() => player.actionToken, (token) => {
  if (token === lastToken || !audio.value) return;
  lastToken = token;
  if (audio.value.paused) {
    audio.value.play().catch((err: unknown) => {
      player.setError(err instanceof Error ? err.message : 'Playback blocked');
      player.setPlaying(false);
    });
  } else {
    audio.value.pause();
  }
});

onMounted(async () => {
  try {
    const info = await api.streamUrl();
    player.setStream(info.url, info.name);
    if (audio.value) {
      audio.value.src = info.url;
      audio.value.preload = 'none';
    }
  } catch (e) {
    player.setError('Stream no disponible');
    player.setStream('#no-stream', player.stationName || 'Radio');
    console.warn('[AudioCore] stream-url failed', e);
  }
});

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

onMounted(() => {
  const a = audio.value;
  if (!a) return;
  a.volume = player.volume;
  a.muted = player.muted;

  a.addEventListener('play', () => player.setPlaying(true));
  a.addEventListener('pause', () => player.setPlaying(false));
  a.addEventListener('waiting', () => player.setBuffering(true));
  a.addEventListener('playing', () => player.setBuffering(false));
  a.addEventListener('canplay', () => player.setBuffering(false));
  a.addEventListener('error', () => {
    player.setError('Stream error');
    player.setPlaying(false);
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => player.requestPlay());
    navigator.mediaSession.setActionHandler('pause', () => player.requestPause());
    navigator.mediaSession.setActionHandler('seekbackward', null);
    navigator.mediaSession.setActionHandler('seekforward', null);
  }
});

watch(() => player.volume, (v) => { if (audio.value) audio.value.volume = v; });
watch(() => player.muted, (m) => { if (audio.value) audio.value.muted = m; });
watch(() => np.current, () => updateMetadata(), { deep: true });
watch(() => player.isPlaying, (p) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = p ? 'playing' : 'paused';
  }
});
</script>

<template>
  <audio
    ref="audio"
    class="hidden"
    playsinline
    preload="none"
  />
</template>
