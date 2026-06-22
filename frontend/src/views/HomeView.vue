<script setup lang="ts">
import { ref } from 'vue';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { usePlayerStore } from '@/stores/player';
import RightPanel from '@/components/RightPanel.vue';
import OrbitalRing from '@/components/OrbitalRing.vue';
import logoUrl from '@/assets/airemedia.png';

const np = useNowPlayingStore();
const player = usePlayerStore();
const audioCore = ref<{ tryPlay: () => void; pause: () => void } | null>(null);

function onPlay(): void { audioCore.value?.tryPlay(); }
function onPause(): void { audioCore.value?.pause(); }
</script>

<template>
  <section class="grid md:grid-cols-[2fr_1fr] gap-4 sm:gap-5 lg:gap-8 h-auto lg:h-[calc(100vh-3rem)]">
    <!-- LEFT: Logo + Cover + Controls -->
    <div class="flex flex-col items-center justify-center gap-3 sm:gap-4 min-h-0 lg:py-4">
      <!-- Logo -->
      <div class="fixed top-4 left-4 z-30">
        <div class="absolute -inset-4 rounded-full blur-2xl opacity-60"
          style="background: radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 70%);" />
        <img :src="logoUrl" alt="AireMedia" class="relative h-20 sm:h-32 lg:h-44 w-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
      </div>

      <!-- Cover art (circular) -->
      <div class="relative w-full max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg aspect-square shrink-0">
        <!-- Bloom behind cover (auto from image or fallback) -->
        <div
          v-if="np.current?.art"
          class="absolute -inset-8 sm:-inset-10 rounded-full transition-all duration-[2000ms]"
          :style="{
            backgroundImage: `url(${np.current.art})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(70px) saturate(2.5) brightness(0.5)',
            opacity: 0.6,
          }"
        />
        <div
          v-else
          class="absolute -inset-8 sm:-inset-10 rounded-full transition-all duration-[2000ms]"
          :style="{
            background: `radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            opacity: 0.5,
          }"
        />

        <!-- Orbital rings -->
        <OrbitalRing
          :image-url="np.current?.art ?? null"
          :seed="(np.current?.title ?? '') + '|' + (np.current?.artist ?? '')"
          :is-playing="player.isPlaying"
        />

        <!-- Cover (circle) -->
        <div class="relative rounded-full overflow-hidden h-full w-full ring-4 ring-white/10"
          style="box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.12);">
          <img v-if="np.current?.art" :src="np.current.art" :alt="np.current.title ?? 'cover'" class="h-full w-full object-cover" />
          <div v-else class="h-full w-full grid place-items-center text-white text-4xl sm:text-6xl font-bold"
            style="background: linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f472b6 100%);">R</div>
          <!-- Glass overlay (circular) -->
          <div class="absolute inset-0 pointer-events-none rounded-full"
            style="background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.4) 100%);" />
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button type="button" class="btn-primary text-sm sm:text-base px-6 py-2.5 sm:px-8 sm:py-3"
          :disabled="!player.canPlay && !player.error"
          @click="player.isPlaying ? onPause() : onPlay()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 sm:h-5 sm:w-5">
            <path v-if="player.isPlaying" d="M6 5h4v14H6zM14 5h4v14h-4z" />
            <path v-else d="M8 5v14l11-7z" />
          </svg>
          <span>{{ player.isPlaying ? 'PAUSAR' : 'PLAY' }}</span>
        </button>
        <a v-if="player.streamUrl && !player.error" :href="player.streamUrl" target="_blank" rel="noopener" class="btn-ghost text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 sm:h-4 sm:w-4">
            <path d="M10.59 13.41a1 1 0 0 1 0-1.41L13.17 9.4a3 3 0 0 1 4.24 4.24l-1.58 1.59a1 1 0 0 1-1.42-1.42l1.59-1.58a1 1 0 0 0-1.42-1.42l-2.59 2.59a1 1 0 0 1-1.42 0z"/>
            <path d="M13.41 10.59a1 1 0 0 1 0 1.41L10.83 14.6a3 3 0 0 1-4.24-4.24l1.58-1.59a1 1 0 0 1 1.42 1.42l-1.59 1.58a1 1 0 0 0 1.42 1.42l2.59-2.59a1 1 0 0 1 1.42 0z"/>
          </svg>
          <span>STREAM</span>
        </a>
        <!-- Volume -->
        <div class="flex items-center gap-1.5">
          <button type="button" class="text-slate-500 hover:text-white transition p-1" @click="player.setMuted(!player.muted)">
            <svg v-if="player.muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 sm:h-4 sm:w-4">
              <path d="M3 9v6h4l5 4V5L7 9H3z" />
              <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 sm:h-4 sm:w-4">
              <path d="M3 9v6h4l5 4V5L7 9H3zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
            </svg>
          </button>
          <input type="range" min="0" max="100" step="1"
            :value="player.muted ? 0 : player.volume * 100"
            @input="player.setVolume(Number(($event.target as HTMLInputElement).value) / 100)"
            class="w-16 sm:w-20" />
        </div>
      </div>

      <!-- Error -->
      <p v-if="player.error" class="text-xs text-amber-400">⚠ {{ player.error }}</p>
    </div>

    <!-- RIGHT: Panel with tabs -->
    <div class="min-h-0 lg:h-full">
      <RightPanel />
    </div>
  </section>
</template>
