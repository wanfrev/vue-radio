<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const audio = ref<HTMLAudioElement | null>(null);
const showPlayBtn = ref(false);
const player = usePlayerStore();
const np = useNowPlayingStore();

function tryPlay(): void {
  if (!audio.value || !player.canPlay) return;
  const a = audio.value;
  if (a.paused) {
    a.play().then(() => {
      player.setPlaying(true);
      player.error = null;
      showPlayBtn.value = false;
    }).catch(() => {
      player.setPlaying(false);
      showPlayBtn.value = true;
    });
  }
}

function onUserGesture(): void {
  tryPlay();
  if (!showPlayBtn.value) {
    document.removeEventListener('click', onUserGesture);
    document.removeEventListener('touchend', onUserGesture);
  }
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

  a.addEventListener('play', () => { player.setPlaying(true); showPlayBtn.value = false; });
  a.addEventListener('pause', () => player.setPlaying(false));
  a.addEventListener('waiting', () => player.setBuffering(true));
  a.addEventListener('playing', () => player.setBuffering(false));
  a.addEventListener('canplay', () => player.setBuffering(false));
  a.addEventListener('error', () => player.setPlaying(false));

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => tryPlay());
    navigator.mediaSession.setActionHandler('pause', () => { if (audio.value) { audio.value.pause(); } });
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

  <button
    v-if="showPlayBtn && player.canPlay"
    type="button"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg hover:bg-white/20 active:scale-95 transition-all"
    @click="tryPlay"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
      <path d="M8 5v14l11-7z" />
    </svg>
    Toca para escuchar
  </button>
</template>
