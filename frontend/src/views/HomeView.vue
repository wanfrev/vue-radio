<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import logoUrl from '@/assets/airemediailuminado.png';

const player = usePlayerStore();

const volumePct = computed(() => player.muted ? 0 : Math.round(player.volume * 100));
</script>

<template>
  <section class="flex flex-col items-start justify-center min-h-[100dvh] px-4 pt-14 pb-8">
    <div class="flex flex-col items-center ml-4">
      <img
        :src="logoUrl"
        alt="AireMedia"
        class="w-auto max-h-[65vh] max-w-[95vw] object-contain"
      />

      <!-- Botón Escuchar en vivo (desaparece cuando ya suena) -->
      <button
        v-if="!player.isPlaying"
        type="button"
        :disabled="!player.canPlay"
        class="mt-8 px-10 py-4 rounded-full bg-slate-900 text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
        :class="!player.canPlay ? 'opacity-50' : 'hover:bg-slate-800'"
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

      <!-- Control de volumen (aparece solo cuando está sonando) -->
      <div v-if="player.isPlaying" class="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 w-48 mt-8 -translate-x-8">
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
          class="flex-1 h-1"
        />
      </div>
    </div>
  </section>
</template>
