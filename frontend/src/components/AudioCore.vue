<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const audio = ref<HTMLAudioElement | null>(null);
const player = usePlayerStore();
const np = useNowPlayingStore();

function tryPlay(): void {
  if (!audio.value || !player.canPlay) return;
  if (audio.value.paused) {
    audio.value.play().then(() => {
      player.setPlaying(true);
      player.error = null;
      document.removeEventListener('click', onDocumentClick);
    }).catch(() => {
      player.setPlaying(false);
    });
  }
}

function onDocumentClick(): void {
  tryPlay();
}

onMounted(async () => {
  try {
    const info = await api.streamUrl();
    player.setStream(info.url, info.name);
    if (audio.value) {
      audio.value.src = info.url;
      audio.value.preload = 'none';
    }
    tryPlay();
    document.addEventListener('click', onDocumentClick);
  } catch (e) {
    player.setError('Stream no disponible');
    player.setStream('#no-stream', player.stationName || 'Radio');
    console.warn('[AudioCore] stream-url failed', e);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
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
    player.setPlaying(false);
  });
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
