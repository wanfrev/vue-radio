<script setup lang="ts">
import { useNowPlayingStore } from '@/stores/nowPlaying';
import CoverArt from '@/components/CoverArt.vue';

const np = useNowPlayingStore();

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <section>
    <header class="mb-5">
      <h1 class="text-2xl font-bold">Historial</h1>
      <p class="text-slate-400 text-sm">Últimas canciones que sonaron en la radio.</p>
    </header>

    <div v-if="np.history.length === 0" class="card text-slate-400 text-sm">
      Aún no hay canciones en el historial. Vuelve en unos minutos.
    </div>

    <ul v-else class="divide-y divide-slate-800 card p-0 overflow-hidden">
      <li
        v-for="(item, i) in np.history"
        :key="`${item.startedAt}-${i}`"
        class="flex items-center gap-3 px-4 py-3"
      >
        <CoverArt :src="item.art" :alt="item.title" size="sm" />
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{{ item.title }}</div>
          <div class="truncate text-sm text-slate-400">{{ item.artist }}</div>
        </div>
        <div class="text-xs text-slate-500 tabular-nums">{{ fmtTime(item.startedAt) }}</div>
      </li>
    </ul>
  </section>
</template>
