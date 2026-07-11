<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import logoUrl from '@/assets/airemediailuminado.png';

const player = usePlayerStore();
const np = useNowPlayingStore();
const started = ref(false);

function start(): void {
  started.value = true;
  window.dispatchEvent(new CustomEvent('radio:play'));
}

function togglePlay(): void {
  if (player.isPlaying) {
    window.dispatchEvent(new CustomEvent('radio:pause'));
  } else {
    window.dispatchEvent(new CustomEvent('radio:play'));
  }
}

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

      <!-- Reproductor -->
      <div v-if="started" class="mt-8 w-72 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl p-4 -translate-x-8">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-10 w-10 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
            <img v-if="np.current?.art" :src="np.current.art" alt="" class="h-full w-full object-cover" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 text-slate-600">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
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

        <div class="flex items-center gap-2">
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
      </div>
    </div>
  </section>
</template>
