<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { usePlayerStore } from '@/stores/player';
import { useClipboard } from '@/composables/useClipboard';
import type { DonationAccount } from '@/services/api';
import CoverArt from '@/components/CoverArt.vue';
import LiveStatusBadge from '@/components/admin/LiveStatusBadge.vue';

interface LiveState {
  isLive: boolean;
  streamerName: string | null;
  lastChecked: number;
  azuracastAvailable: boolean;
}

interface Credentials {
  mountpoint: string;
  username: string;
  password: string;
  fullUrl: string;
}

const np = useNowPlayingStore();
const player = usePlayerStore();
const { copied, copy } = useClipboard();

const liveState = ref<LiveState>({ isLive: false, streamerName: null, lastChecked: 0, azuracastAvailable: false });
const creds = ref<Credentials | null>(null);
const loading = ref(true);
const actionLoading = ref<string | null>(null);
const error = ref<string | null>(null);
const actionLog = ref<{ time: Date; action: string; ok: boolean }[]>([]);
const donationAccounts = ref<DonationAccount[]>([]);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastCopied = '';

function addLog(action: string, ok: boolean) {
  actionLog.value.unshift({ time: new Date(), action, ok });
  if (actionLog.value.length > 10) actionLog.value.pop();
  if (!ok) error.value = action;
  else error.value = null;
}

async function fetchData(): Promise<void> {
  try {
    const [sr, cr] = await Promise.all([
      fetch('/api/admin/live/status', { credentials: 'include', headers: { Accept: 'application/json' } }),
      fetch('/api/admin/live/credentials', { credentials: 'include', headers: { Accept: 'application/json' } }),
    ]);
    if (sr.ok) liveState.value = (await sr.json()) as LiveState;
    if (cr.ok) creds.value = (await cr.json()) as Credentials;
    error.value = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error';
  } finally {
    loading.value = false;
  }
}

async function fetchDonations(): Promise<void> {
  try {
    const res = await fetch('/api/admin/donations', { credentials: 'include', headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = (await res.json()) as { accounts: DonationAccount[] };
      donationAccounts.value = data.accounts.filter(a => a.active);
    }
  } catch {}
}

async function postAction(endpoint: string, label: string): Promise<void> {
  if (actionLoading.value) return;
  actionLoading.value = endpoint;
  try {
    const res = await fetch(`/api/admin/live/${endpoint}`, { method: 'POST', credentials: 'include' });
    const ok = res.ok;
    addLog(label, ok);
    if (ok) await fetchData();
  } catch {
    addLog(label, false);
  } finally {
    actionLoading.value = null;
  }
}

function fmtTime(ts: number): string {
  if (!ts) return '--:--:--';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function logTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const azuracastUrl = computed(() => creds.value?.fullUrl.replace(/\/stream.*$/, '/dashboard') ?? '#');

onMounted(() => {
  void fetchData();
  void fetchDonations();
  pollTimer = setInterval(() => void fetchData(), 5000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <RouterLink to="/admin/studio/guide" class="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
        Manual del Locutor →
      </RouterLink>
    </div>

    <div v-if="loading" class="text-sm text-slate-400">Cargando…</div>

    <template v-else>
      <!-- Estado LIVE + stats rápidas -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          :class="[
            'card border-2 sm:col-span-2 lg:col-span-2 transition-all duration-500',
            liveState.isLive
              ? 'border-red-500/60 bg-red-500/5'
              : 'border-emerald-500/30',
          ]"
        >
          <div class="flex items-center justify-between">
            <LiveStatusBadge :is-live="liveState.isLive" :streamer-name="liveState.streamerName" :pulse="true" size-class="text-sm px-3 py-1.5 font-bold" />
            <span class="text-xs text-slate-500">{{ fmtTime(liveState.lastChecked) }}</span>
          </div>
          <p :class="['text-xs mt-2', liveState.isLive ? 'text-red-300/80' : 'text-emerald-400/80']">
            {{ liveState.isLive ? 'AutoDJ pausado · Oyentes escuchan al locutor' : 'AutoDJ activo · Programación normal' }}
          </p>
        </div>

        <div class="card flex flex-col justify-center">
          <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Oyentes</div>
          <div class="text-2xl font-bold tabular-nums">{{ np.current?.listeners ?? '—' }}</div>
        </div>

        <div class="card flex flex-col justify-center">
          <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Stream</div>
          <div class="text-xs font-mono text-slate-300 truncate" :title="player.streamUrl || ''">
            {{ player.streamUrl?.replace(/https?:\/\//, '').split('/')[0] ?? '—' }}
          </div>
        </div>
      </div>

      <!-- Ahora suena + Donaciones -->
      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 space-y-6">
          <div v-if="np.current" class="card flex items-center gap-4">
            <CoverArt :src="np.current.art" :alt="np.current.title" size="lg" />
            <div class="min-w-0">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Sonando ahora</div>
              <div class="text-lg font-bold truncate">{{ np.current.title }}</div>
              <div class="text-slate-400 truncate">{{ np.current.artist }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ np.current.album }}</div>
            </div>
          </div>

          <!-- Controles -->
          <div class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Controles</h2>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :disabled="actionLoading === 'skip'"
                class="btn text-sm justify-center"
                @click="postAction('skip', 'Saltar canción')"
              >
                <span v-if="actionLoading === 'skip'" class="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-300 animate-spin" />
                <span v-else>Saltar canción</span>
              </button>
              <button
                type="button"
                :disabled="actionLoading === 'stop-autodj'"
                class="btn text-sm justify-center bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 ring-1 ring-amber-500/30"
                @click="postAction('stop-autodj', 'Pausar AutoDJ')"
              >
                <span v-if="actionLoading === 'stop-autodj'" class="h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-300 animate-spin" />
                <span v-else>Pausar AutoDJ</span>
              </button>
              <button
                type="button"
                :disabled="actionLoading === 'restart-autodj'"
                class="btn text-sm justify-center bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30"
                @click="postAction('restart-autodj', 'Reiniciar AutoDJ')"
              >
                <span v-if="actionLoading === 'restart-autodj'" class="h-4 w-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-300 animate-spin" />
                <span v-else>Reiniciar AutoDJ</span>
              </button>
              <button
                type="button"
                :disabled="actionLoading === 'disconnect'"
                class="btn text-sm justify-center bg-red-500/15 text-red-300 hover:bg-red-500/25 ring-1 ring-red-500/30"
                @click="postAction('disconnect', 'Desconectar DJ')"
              >
                <span v-if="actionLoading === 'disconnect'" class="h-4 w-4 rounded-full border-2 border-red-400/30 border-t-red-300 animate-spin" />
                <span v-else>Desconectar DJ</span>
              </button>
            </div>
          </div>

          <!-- Bitácora -->
          <div class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Bitácora</h2>
            <div v-if="actionLog.length === 0" class="text-xs text-slate-600">No hay acciones recientes.</div>
            <ul v-else class="space-y-1.5">
              <li v-for="(entry, i) in actionLog" :key="i" class="flex items-center gap-2 text-xs">
                <span :class="['inline-block h-2 w-2 rounded-full shrink-0', entry.ok ? 'bg-emerald-400' : 'bg-red-400']" />
                <span class="text-slate-500 font-mono w-14 shrink-0">{{ logTime(entry.time) }}</span>
                <span :class="entry.ok ? 'text-slate-300' : 'text-red-400'">{{ entry.action }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Columna derecha -->
        <div class="space-y-6">
          <!-- Regálame un café -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs uppercase tracking-wider text-slate-500">Regálame un café</span>
              <RouterLink to="/admin/donations" class="text-xs text-cyan-400 hover:text-cyan-300">Editar</RouterLink>
            </div>
            <template v-if="donationAccounts.length > 0">
              <ul class="space-y-3">
                <li v-for="acc in donationAccounts" :key="acc.id" class="text-sm">
                  <div class="font-medium text-slate-200">{{ acc.bankName }}</div>
                  <div class="text-slate-500 text-xs mt-0.5">{{ acc.accountHolder }}</div>
                  <code class="text-xs text-slate-400 font-mono">{{ acc.clabe }}</code>
                </li>
              </ul>
            </template>
            <p v-else class="text-sm text-slate-500">
              Sin cuentas.
              <RouterLink to="/admin/donations" class="text-cyan-400 hover:text-cyan-300">Añadir</RouterLink>
            </p>
          </div>

          <!-- Conexión DJ -->
          <div v-if="creds" class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Conexión DJ</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">Mountpoint</dt>
                <dd class="text-slate-200 font-mono truncate">{{ creds.mountpoint }}</dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">URL</dt>
                <dd class="text-slate-200 font-mono text-xs truncate">{{ creds.fullUrl }}</dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">Usuario</dt>
                <dd class="text-slate-200 font-mono">{{ creds.username }}</dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">Contraseña</dt>
                <dd class="text-slate-200 font-mono">{{ creds.password }}</dd>
              </div>
            </dl>
            <div class="flex gap-2 mt-3 flex-wrap">
              <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition" @click="lastCopied = 'pass'; copy(creds.password)">{{ copied && lastCopied === 'pass' ? 'Copiada' : 'Copiar pass' }}</button>
              <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition" @click="lastCopied = 'url'; copy(creds.fullUrl)">{{ copied && lastCopied === 'url' ? 'Copiada' : 'Copiar URL' }}</button>
            </div>
          </div>

          <!-- Azuracast -->
          <div class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Música</h2>
            <p class="text-xs text-slate-400 mb-3">Subir archivos, crear playlists.</p>
            <a
              :href="azuracastUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 ring-1 ring-brand-500/30 transition"
            >
              Abrir Azuracast
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-400 p-3 bg-red-500/10 rounded-lg ring-1 ring-red-500/20">
        {{ error }}
      </div>
    </template>
  </div>
</template>
