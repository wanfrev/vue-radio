<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { usePlayerStore } from '@/stores/player';
import CoverArt from '@/components/CoverArt.vue';

const np = useNowPlayingStore();
const player = usePlayerStore();

const uptime = ref(0);
const connStatus = ref<'loading' | 'connected' | 'error'>('loading');

onMounted(() => {
  const start = Date.now();
  setInterval(() => { uptime.value = Math.floor((Date.now() - start) / 1000); }, 1000);

  // Check connection
  fetch('/api/health').then(r => {
    connStatus.value = r.ok ? 'connected' : 'error';
  }).catch(() => {
    connStatus.value = 'error';
  });
});

function fmtUptime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

const connColor: Record<string, string> = {
  loading: 'text-slate-400',
  connected: 'text-emerald-400',
  error: 'text-red-400',
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Now Playing -->
      <div class="card col-span-full sm:col-span-2 flex items-center gap-4">
        <CoverArt :src="np.current?.art ?? null" :alt="np.current?.title ?? ''" size="lg" />
        <div class="min-w-0">
          <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Sonando ahora</div>
          <div class="text-lg font-bold truncate">{{ np.current?.title ?? '—' }}</div>
          <div class="text-slate-400 truncate">{{ np.current?.artist ?? '' }}</div>
          <div class="text-sm text-slate-500 mt-1">{{ np.current?.album ?? '' }}</div>
        </div>
      </div>

      <!-- Listeners -->
      <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Oyentes</div>
        <div class="text-3xl font-bold tabular-nums">{{ np.current?.listeners ?? '—' }}</div>
      </div>

      <!-- Uptime -->
      <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Uptime del panel</div>
        <div class="text-lg font-bold tabular-nums">{{ fmtUptime(uptime) }}</div>
      </div>

      <!-- Backend connection -->
      <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Conexión al backend</div>
        <div :class="['text-lg font-bold', connColor[connStatus]]">
          {{ connStatus === 'loading' ? 'Verificando…' : connStatus === 'connected' ? 'Conectado' : 'Error' }}
        </div>
      </div>

      <!-- History count -->
      <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Canciones en historial</div>
        <div class="text-3xl font-bold tabular-nums">{{ np.history.length }}</div>
      </div>

      <!-- Stream info -->
      <div class="card flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Stream</div>
        <div class="text-sm truncate" :title="player.streamUrl || '—'">
          {{ player.streamUrl?.replace(/https?:\/\//, '').split('/')[0] ?? '—' }}
        </div>
      </div>
    </div>
  </div>
</template>
