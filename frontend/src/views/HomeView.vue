<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import logoUrl from '@/assets/airemediailuminado.png';

const player = usePlayerStore();
const np = useNowPlayingStore();
const audioEl = ref<HTMLAudioElement | null>(null);
const started = ref(false);
const wasPausedByUser = ref(false);

function play(): void {
  const a = audioEl.value;
  if (!a || !player.canPlay) return;
  wasPausedByUser.value = false;
  a.play().then(() => {
    player.setPlaying(true);
  }).catch((e) => {
    console.warn('[HomeView] play failed', e);
  });
}

function pause(): void {
  wasPausedByUser.value = true;
  audioEl.value?.pause();
}

function resumeLive(): void {
  const a = audioEl.value;
  if (!a || !player.canPlay) return;
  a.src = player.streamUrl;
  a.load();
  wasPausedByUser.value = false;
  a.play().then(() => {
    player.setPlaying(true);
  }).catch((e) => {
    console.warn('[HomeView] resumeLive failed', e);
  });
}

function start(): void {
  player.setError(null);
  const a = audioEl.value;
  if (!a) return;

  if (!a.src || a.src !== player.streamUrl) {
    a.src = player.streamUrl;
    a.load();
  }

  started.value = true;
  wasPausedByUser.value = false;

  a.play().then(() => {
    player.setPlaying(true);
  }).catch((e) => {
    console.warn('[HomeView] start play failed', e);
  });
}

function togglePlay(): void {
  if (player.isPlaying) {
    pause();
  } else if (audioEl.value) {
    if (wasPausedByUser.value) {
      resumeLive();
    } else {
      play();
    }
  }
}

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

function unlockAudioIOS(): void {
  const a = audioEl.value;
  if (!a) return;
  a.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYkFh6AAAAAAAAAAAAAAAAAAAAA//tQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYsTwjTAAAAAAAAAAAAAAAAAAAAA';
  a.play().then(() => {
    a.pause();
    a.currentTime = 0;
    a.removeAttribute('src');
    a.load();
  }).catch(() => {});
}

onMounted(async () => {
  try {
    const info = await api.streamUrl();
    player.setStream(info.url, info.name);
  } catch (e) {
    player.setError('Stream no disponible');
    console.warn('[HomeView] stream-url failed', e);
  }

  if (audioEl.value) {
    audioEl.value.volume = player.volume;
    audioEl.value.muted = player.muted;

    audioEl.value.addEventListener('play', () => player.setPlaying(true));
    audioEl.value.addEventListener('pause', () => player.setPlaying(false));
    audioEl.value.addEventListener('waiting', () => player.setBuffering(true));
    audioEl.value.addEventListener('playing', () => player.setBuffering(false));
    audioEl.value.addEventListener('canplay', () => player.setBuffering(false));
    audioEl.value.addEventListener('error', () => {
      player.setPlaying(false);
      player.setError('Error al reproducir');
    });
    audioEl.value.addEventListener('ended', () => {
      if (started.value && !wasPausedByUser.value) {
        audioEl.value!.src = player.streamUrl;
        audioEl.value!.load();
        audioEl.value!.play().catch(() => {});
      }
    });
  }

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => play());
    navigator.mediaSession.setActionHandler('pause', () => pause());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible'
        && started.value
        && audioEl.value
        && audioEl.value.paused
        && !wasPausedByUser.value
        && !player.error) {
      play();
    }
  });

  window.addEventListener('touchstart', unlockAudioIOS, { once: true });
  window.addEventListener('click', unlockAudioIOS, { once: true });
});

onBeforeUnmount(() => {
  if (audioEl.value) {
    audioEl.value.pause();
    audioEl.value.removeAttribute('src');
    audioEl.value.load();
  }
});

watch(() => player.volume, (v) => { if (audioEl.value) audioEl.value.volume = v; });
watch(() => player.muted, (m) => { if (audioEl.value) audioEl.value.muted = m; });
watch(() => np.current, () => updateMetadata(), { deep: true });
watch(() => player.isPlaying, (p) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = p ? 'playing' : 'paused';
  }
});

watch(() => player.error, (e) => {
  if (e && audioEl.value) {
    audioEl.value.pause();
    player.setPlaying(false);
  }
});

const volumePct = computed(() => player.muted ? 0 : Math.round(player.volume * 100));
</script>

<template>
  <section class="flex flex-col items-start justify-center min-h-[100dvh] px-4 pt-14 pb-8">
    <div class="flex flex-col items-center ml-4">
      <img
        :src="logoUrl"
        alt="AireMedia"
        class="w-auto max-h-[55vh] max-w-[95vw] object-contain"
      />

      <button
        v-if="!started"
        type="button"
        :disabled="!player.canPlay"
        class="mt-8 px-10 py-4 rounded-full bg-slate-900 text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
        :class="!player.canPlay ? 'opacity-50' : 'hover:bg-slate-800'"
        @click="start"
      >
        <span v-if="!player.canPlay" class="inline-flex items-center gap-2">
          <span class="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Conectando...
        </span>
        <span v-else class="inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path d="M8 5v14l11-7z" />
          </svg>
          Escuchar en vivo
        </span>
      </button>

      <div v-if="started" class="mt-8 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl p-4 -translate-x-8">
        <div class="flex items-center gap-3 mb-3">
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold truncate text-white">{{ np.current?.title || 'Aire Media' }}</div>
            <div class="text-xs text-slate-400 truncate">{{ np.current?.artist || 'En vivo' }}</div>
          </div>
          <div v-if="player.isBuffering" class="flex items-center gap-1 text-xs text-slate-400">
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" style="animation-delay: 0.1s" />
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" style="animation-delay: 0.2s" />
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <button
            type="button"
            class="flex items-center justify-center h-10 w-10 rounded-full bg-white text-slate-900 hover:scale-105 active:scale-95 transition-all shrink-0"
            @click="togglePlay"
          >
            <svg v-if="player.isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <div class="flex-1 flex items-center gap-2">
            <button type="button" class="text-slate-400 hover:text-white transition shrink-0" @click="player.setMuted(!player.muted)">
              <svg v-if="player.muted || volumePct === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              <svg v-else-if="volumePct < 50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
            <input
              type="range" min="0" max="100" step="1"
              :value="volumePct"
              @input="player.setVolume(Number(($event.target as HTMLInputElement).value) / 100)"
              class="flex-1 h-1 accent-white"
            />
          </div>
        </div>

        <button
          v-if="!player.isPlaying && started"
          type="button"
          class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 active:scale-95 transition-all"
          @click="resumeLive"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
            <path d="M5 3v18l14-9z" />
          </svg>
          Volver al en vivo
        </button>
      </div>
    </div>

    <audio
      ref="audioEl"
      playsinline
      autoplay
      preload="auto"
      class="fixed top-0 left-0 w-px h-px opacity-[0.01] pointer-events-none"
    />
  </section>
</template>
