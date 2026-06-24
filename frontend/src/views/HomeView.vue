<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import RightPanel from '@/components/RightPanel.vue';
import logoUrl from '@/assets/airemedia.png';

const player = usePlayerStore();
const np = useNowPlayingStore();
const audioCore = ref<{ tryPlay: () => void; pause: () => void } | null>(null);

function onPlay(): void { audioCore.value?.tryPlay(); }
function onPause(): void { audioCore.value?.pause(); }

const volumePct = computed(() => player.muted ? 0 : Math.round(player.volume * 100));
</script>

<template>
  <section class="grid md:grid-cols-[2fr_1fr] gap-4 sm:gap-5 lg:gap-8 h-auto lg:h-[calc(100vh-3rem)]">
    <!-- LEFT: Logo + Controls -->
    <div class="flex flex-col items-center justify-center gap-4 sm:gap-6 min-h-0 lg:py-4 w-full px-4">
      <!-- Logo -->
      <img :src="logoUrl" alt="AireMedia" class="mx-auto h-[40vh] sm:h-[60vh] lg:h-[70vh] w-auto max-w-[90vw] drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]" />

      <!-- Now playing info -->
      <div v-if="np.current" class="text-center">
        <p class="text-white text-sm sm:text-base font-semibold truncate max-w-xs drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{{ np.current.title }}</p>
        <p class="text-slate-100 text-xs opacity-80">{{ np.current.artist }}</p>
      </div>

      <!-- Controls: Solid glass bar -->
      <div
        class="flex items-center gap-4 sm:gap-6 px-5 py-3 rounded-2xl"
        style="background: rgba(5,5,20,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(34,211,238,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(34,211,238,0.15);"
      >
        <!-- Play / Pause -->
        <button type="button"
          class="h-14 w-14 sm:h-16 sm:w-16 rounded-full grid place-items-center transition-all duration-300 shrink-0"
          :style="{
            background: player.isPlaying
              ? 'linear-gradient(135deg, #22d3ee, #a855f7)'
              : 'linear-gradient(135deg, #06b6d4, #7c3aed)',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: player.isPlaying
              ? '0 0 32px rgba(34,211,238,0.6), 0 0 64px rgba(168,85,247,0.3)'
              : '0 4px 24px rgba(0,0,0,0.5), 0 0 32px rgba(34,211,238,0.5)',
          }"
          @click="player.isPlaying ? onPause() : onPlay()"
        >
          <svg v-if="player.isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="h-7 w-7 sm:h-8 sm:w-8">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="h-7 w-7 sm:h-8 sm:w-8 ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <!-- Volume -->
        <div class="flex items-center gap-3 flex-1">
          <button type="button" class="text-white/80 hover:text-white transition p-1 shrink-0"
            @click="player.setMuted(!player.muted)">
            <svg v-if="player.muted || volumePct === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M3 9v6h4l5 4V5L7 9H3z" />
              <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
            <svg v-else-if="volumePct < 50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M3 9v6h4l5 4V5L7 9H3zm11 3a4 4 0 0 0-2-3.5v7A4 4 0 0 0 14 12z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M3 9v6h4l5 4V5L7 9H3zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
            </svg>
          </button>
          <input type="range" min="0" max="100" step="1"
            :value="volumePct"
            @input="player.setVolume(Number(($event.target as HTMLInputElement).value) / 100)"
            class="flex-1 volume-bright" />
        </div>
      </div>

      <p v-if="player.error" class="text-xs text-amber-400">⚠ {{ player.error }}</p>
    </div>

    <!-- RIGHT: Panel with tabs -->
    <div class="min-h-0 lg:h-full">
      <RightPanel />
    </div>
  </section>
</template>
