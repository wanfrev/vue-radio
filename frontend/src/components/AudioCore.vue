<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const audio = ref<HTMLAudioElement | null>(null);
const player = usePlayerStore();
const np = useNowPlayingStore();

function play(): void {
  if (!audio.value || !player.canPlay) return;
  audio.value.play().then(() => {
    player.setPlaying(true);
    player.error = null;
  }).catch(() => {
    player.setPlaying(false);
  });
}

function pause(): void {
  if (!audio.value) return;
  audio.value.pause();
}

function onUserGesture(): void {
  play();
}

onMounted(async () => {
  try {
    const info = await api.streamUrl();
    player.setStream(info.url, info.name);
    if (audio.value) {
      audio.value.src = info.url;
      audio.value.preload = 'none';
    }
    document.addEventListener('click', onUserGesture);
    document.addEventListener('touchend', onUserGesture);
  } catch (e) {
    player.setError('Stream no disponible');
    console.warn('[AudioCore] stream-url failed', e);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onUserGesture);
  document.removeEventListener('touchend', onUserGesture);
  window.removeEventListener('radio:play', play);
  window.removeEventListener('radio:pause', pause);
});

onMounted(() => {
  window.addEventListener('radio:play', play);
  window.addEventListener('radio:pause', pause);
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
  a.addEventListener('error', () => player.setPlaying(false));
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
