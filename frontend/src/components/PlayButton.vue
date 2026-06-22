<script setup lang="ts">
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const player = usePlayerStore();
const np = useNowPlayingStore();

const props = withDefaults(
  defineProps<{
    /** Function that starts playback (provided by AudioCore). */
    onPlay:  () => void;
    onPause: () => void;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' }
);

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

const iconSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

function handle(): void {
  if (player.error) return;
  if (player.isPlaying) props.onPause();
  else if (player.canPlay) props.onPlay();
}
</script>

<template>
  <button
    type="button"
    :aria-label="player.isPlaying ? 'Pausar' : 'Reproducir'"
    :disabled="!player.canPlay || !np.current"
    @click="handle"
    :class="[
      'group relative inline-flex items-center justify-center rounded-full',
      'bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-white shadow-lg shadow-brand-900/40',
      'transition disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClass[size],
    ]"
  >
    <span
      v-if="player.isBuffering"
      :class="['inline-block rounded-full border-2 border-white/40 border-t-white animate-spin', iconSize[size]]"
    />
    <svg
      v-else-if="player.isPlaying"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      :class="iconSize[size]"
      aria-hidden="true"
    >
      <rect x="6"  y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      :class="iconSize[size]"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  </button>
</template>
