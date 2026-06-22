<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useClipboard } from '@/composables/useClipboard';
import LiveStatusBadge from '@/components/admin/LiveStatusBadge.vue';

interface LiveState {
  isLive: boolean;
  streamerName: string | null;
  lastChecked: number;
  azuracastAvailable: boolean;
}

interface Credentials {
  mountpoint: string;
  password: string;
  fullUrl: string;
}

const state = ref<LiveState>({
  isLive: false,
  streamerName: null,
  lastChecked: 0,
  azuracastAvailable: false,
});

const creds = ref<Credentials | null>(null);
const loading = ref(true);
const disconnecting = ref(false);
const error = ref<string | null>(null);

const { copied: copyState, copy } = useClipboard();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastCopied = '';

function copyLabel(field: string, value: string): string {
  return copyState && lastCopied === field ? '¡Copiado!' : value;
}

async function fetchData(): Promise<void> {
  try {
    const [sr, cr] = await Promise.all([
      fetch('/api/admin/live/status', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
      fetch('/api/admin/live/credentials', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
    ]);
    if (sr.ok) state.value = (await sr.json()) as LiveState;
    if (cr.ok) creds.value = (await cr.json()) as Credentials;
    error.value = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error';
  } finally {
    loading.value = false;
  }
}

async function handleDisconnect(): Promise<void> {
  if (!confirm('¿Estás seguro? El DJ se desconectará y volverá a sonar el AutoDJ.')) return;
  disconnecting.value = true;
  try {
    const res = await fetch('/api/admin/live/disconnect', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      error.value = data.error ?? 'Error al desconectar';
    } else {
      await fetchData();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error';
  } finally {
    disconnecting.value = false;
  }
}

function fmtTime(ts: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

onMounted(() => {
  void fetchData();
  pollTimer = setInterval(() => void fetchData(), 10000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">En Vivo</h1>

    <div v-if="loading" class="text-sm text-slate-400">Cargando…</div>

    <div v-else-if="!state.azuracastAvailable" class="card text-center py-12">
      <p class="text-slate-400 text-sm mb-2">Azuracast no está configurado.</p>
      <p class="text-slate-500 text-xs">
        Para activar esta función, configura las variables
        <code class="bg-slate-800 px-1 rounded">AZURACAST_BASE_URL</code>,
        <code class="bg-slate-800 px-1 rounded">AZURACAST_API_KEY</code>,
        <code class="bg-slate-800 px-1 rounded">AZURACAST_STATION_ID</code>,
        <code class="bg-slate-800 px-1 rounded">AZURACAST_LIVE_DJ_MOUNTPOINT</code> y
        <code class="bg-slate-800 px-1 rounded">AZURACAST_LIVE_DJ_PASSWORD</code>
        en el <code class="bg-slate-800 px-1 rounded">.env</code>.
      </p>
    </div>

    <template v-else>
      <!-- Status card -->
      <div :class="['card mb-6 border-2', state.isLive ? 'border-red-500/40' : 'border-emerald-500/30']">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Estado</div>
            <LiveStatusBadge :is-live="state.isLive" :streamer-name="state.streamerName" :pulse="true" size-class="text-sm px-3 py-1" />
          </div>
          <div class="text-xs text-slate-500">
            Actualizado {{ fmtTime(state.lastChecked) }}
          </div>
        </div>

        <button
          v-if="state.isLive"
          type="button"
          :disabled="disconnecting"
          class="btn w-full justify-center text-sm text-red-300 bg-red-500/20 hover:bg-red-500/30 ring-1 ring-red-500/30"
          @click="handleDisconnect"
        >
          <span v-if="disconnecting" class="inline-flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-full border-2 border-red-300/40 border-t-red-300 animate-spin" />
            Desconectando…
          </span>
          <span v-else>🚨 Desconectar DJ en vivo</span>
        </button>
      </div>

      <!-- Credentials -->
      <div v-if="creds" class="card mb-6">
        <h2 class="font-semibold mb-3">Para transmitir en vivo</h2>
        <p class="text-sm text-slate-400 mb-4">
          Abre <strong>BUTT</strong> (Broadcast Using This Toolset), Mixxx, u OBS Studio. Usa estas credenciales para conectarte al mountpoint de DJ.
        </p>

        <dl class="space-y-3 text-sm">
          <div class="flex items-center justify-between gap-2">
            <dt class="text-slate-500 shrink-0">URL del mountpoint</dt>
            <dd class="text-slate-200 font-mono truncate">{{ creds.fullUrl }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt class="text-slate-500 shrink-0">Contraseña</dt>
            <dd class="text-slate-200 font-mono">{{ creds.password }}</dd>
          </div>
        </dl>

        <div class="flex gap-2 mt-4">
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            @click="lastCopied = 'url'; copy(creds.fullUrl)"
          >
            {{ copyState && lastCopied === 'url' ? '¡Copiado!' : 'Copiar URL' }}
          </button>
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            @click="lastCopied = 'pass'; copy(creds.password)"
          >
            {{ copyState && lastCopied === 'pass' ? '¡Copiado!' : 'Copiar contraseña' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-400 mb-4">{{ error }}</div>
    </template>
  </div>
</template>
