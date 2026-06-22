<script setup lang="ts">
import { ref } from 'vue';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import CoverArt from '@/components/CoverArt.vue';
import LiveStatusBadge from '@/components/admin/LiveStatusBadge.vue';
import { usePlayerStore } from '@/stores/player';

const np = useNowPlayingStore();
const player = usePlayerStore();
const audioCore = ref<{ tryPlay: () => void; pause: () => void } | null>(null);

function onPlay(): void { audioCore.value?.tryPlay(); }
function onPause(): void { audioCore.value?.pause(); }
</script>

<template>
  <section class="grid md:grid-cols-2 gap-6 items-center">
    <div class="card flex flex-col items-center text-center gap-4 py-10">
      <CoverArt
        :src="np.current?.art ?? null"
        :alt="np.current?.title ?? player.stationName"
        size="xl"
      />
      <div class="min-w-0 w-full">
        <LiveStatusBadge
          v-if="np.current?.isLive"
          :is-live="true"
          :streamer-name="np.current.liveStreamerName ?? null"
          :pulse="true"
          class="mb-2"
        />
        <div class="text-xs uppercase tracking-wider text-slate-400 mb-1">Sonando ahora</div>
        <h1 class="text-2xl font-bold truncate" :title="np.current?.title">
          {{ np.current?.title ?? '—' }}
        </h1>
        <p class="text-slate-400 truncate" :title="np.current?.artist">
          {{ np.current?.artist ?? player.stationName }}
        </p>
        <p v-if="np.current?.album" class="text-sm text-slate-500 truncate">
          {{ np.current.album }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-primary"
          :disabled="!player.canPlay"
          @click="player.isPlaying ? onPause() : onPlay()"
        >
          <span v-if="player.isBuffering">Conectando…</span>
          <span v-else-if="player.isPlaying">Pausar</span>
          <span v-else>Reproducir en vivo</span>
        </button>
        <a v-if="player.streamUrl" :href="player.streamUrl" target="_blank" rel="noopener" class="btn-ghost">
          Abrir stream directo
        </a>
      </div>

      <div v-if="player.error" class="text-sm text-red-400">
        {{ player.error }}
      </div>
    </div>

    <div class="space-y-4">
      <div class="card">
        <h2 class="font-semibold mb-2">Acerca de</h2>
        <p class="text-slate-300 text-sm leading-relaxed">
          {{ player.stationName }} — música 24/7, sin pausas. Pulsa play y listo,
          el audio sigue sonando aunque navegues por la web o bloquees la pantalla.
        </p>
      </div>

      <div class="card">
        <h2 class="font-semibold mb-2">Última canción</h2>
        <div v-if="np.history[0]" class="flex items-center gap-3">
          <CoverArt :src="np.history[0].art" :alt="np.history[0].title" size="sm" />
          <div class="min-w-0">
            <div class="truncate font-medium">{{ np.history[0].title }}</div>
            <div class="truncate text-sm text-slate-400">{{ np.history[0].artist }}</div>
          </div>
        </div>
        <p v-else class="text-sm text-slate-500">Aún no hay historial.</p>
      </div>
    </div>
  </section>
</template>
