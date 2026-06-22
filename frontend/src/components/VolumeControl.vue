<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';

const player = usePlayerStore();

const display = computed(() => (player.muted ? 0 : player.volume * 100));

function onInput(e: Event): void {
  const v = Number((e.target as HTMLInputElement).value) / 100;
  player.setVolume(v);
}

function toggleMute(): void {
  player.setMuted(!player.muted);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="text-slate-300 hover:text-white transition p-1"
      :aria-label="player.muted ? 'Activar sonido' : 'Silenciar'"
      @click="toggleMute"
    >
      <svg
        v-if="player.muted || display === 0"
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path d="M3 9v6h4l5 4V5L7 9H3z" />
        <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
      <svg
        v-else-if="display < 50"
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path d="M3 9v6h4l5 4V5L7 9H3zm11 3a4 4 0 0 0-2-3.5v7A4 4 0 0 0 14 12z" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path d="M3 9v6h4l5 4V5L7 9H3zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
      </svg>
    </button>
    <input
      type="range"
      min="0" max="100" step="1"
      :value="display"
      :aria-label="`Volumen ${Math.round(display)}%`"
      @input="onInput"
      class="w-24 accent-brand-500"
    />
  </div>
</template>
