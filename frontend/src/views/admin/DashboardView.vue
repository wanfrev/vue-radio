<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { usePlayerStore } from '@/stores/player';
import { useClipboard } from '@/composables/useClipboard';
import LiveStatusBadge from '@/components/admin/LiveStatusBadge.vue';

interface LiveState {
  isLive: boolean;
  streamerName: string | null;
  lastChecked: number;
  azuracastAvailable: boolean;
}

interface Credentials {
  host: string;
  port: string;
  mountpoint: string;
  username: string;
  password: string;
  fullUrl: string;
}

interface AzFile {
  id: number;
  name: string;
  path: string;
  size: number;
  mtime: number;
}

interface AzPlaylist {
  id: number;
  name: string;
  is_enabled: boolean;
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
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastCopied = '';

const musicFiles = ref<AzFile[]>([]);
const playlists = ref<AzPlaylist[]>([]);
const uploading = ref(false);
const musicSearch = ref('');
const selectedMusic = ref<Set<number>>(new Set());
const selectedPlaylist = ref<number | null>(null);
const musicMsg = ref<string | null>(null);

const filteredMusic = computed(() => {
  const q = musicSearch.value.toLowerCase();
  return musicFiles.value.filter((f) => f.name.toLowerCase().includes(q));
});

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

async function fetchMusic(): Promise<void> {
  try {
    const [fr, pr] = await Promise.all([
      fetch('/api/admin/music/files', { credentials: 'include', headers: { Accept: 'application/json' } }),
      fetch('/api/admin/music/playlists', { credentials: 'include', headers: { Accept: 'application/json' } }),
    ]);
    if (fr.ok) {
      const d = await fr.json();
      musicFiles.value = (d.files as AzFile[]) ?? [];
    }
    if (pr.ok) {
      const d = await pr.json();
      playlists.value = (d.playlists as AzPlaylist[]) ?? [];
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

function logTime(d: Date): string { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

function fmtSize(b: number): string {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

function toggleSelect(id: number): void { const s = selectedMusic.value; s.has(id) ? s.delete(id) : s.add(id); selectedMusic.value = new Set(s); }
function selectAll(): void {
  if (selectedMusic.value.size === filteredMusic.value.length) selectedMusic.value = new Set();
  else selectedMusic.value = new Set(filteredMusic.value.map((f) => f.id));
}

async function doUpload(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/music/upload', { method: 'POST', credentials: 'include', body: form });
    if (!res.ok) throw new Error('Upload failed');
    await fetchMusic();
    input.value = '';
  } catch { error.value = 'Error al subir'; }
  finally { uploading.value = false; }
}

async function doDeleteMusic(id: number): Promise<void> {
  if (!confirm('Eliminar archivo?')) return;
  try {
    await fetch(`/api/admin/music/file/${id}`, { method: 'DELETE', credentials: 'include' });
    await fetchMusic();
  } catch { error.value = 'Error al eliminar'; }
}

async function doDeleteSelected(): Promise<void> {
  if (selectedMusic.value.size === 0) return;
  if (!confirm(`Eliminar ${selectedMusic.value.size} archivos?`)) return;
  for (const id of selectedMusic.value) {
    await fetch(`/api/admin/music/file/${id}`, { method: 'DELETE', credentials: 'include' });
  }
  selectedMusic.value = new Set();
  await fetchMusic();
}

async function addToPlaylist(): Promise<void> {
  if (!selectedPlaylist.value || selectedMusic.value.size === 0) return;
  try {
    await fetch(`/api/admin/music/playlist/${selectedPlaylist.value}/add`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: [...selectedMusic.value] }),
    });
    const pl = playlists.value.find((p) => p.id === selectedPlaylist.value);
    musicMsg.value = `${selectedMusic.value.size} añadidos a "${pl?.name ?? ''}"`;
    selectedMusic.value = new Set();
    setTimeout(() => (musicMsg.value = null), 3000);
  } catch { error.value = 'Error al agregar a playlist'; }
}

const azuracastUrl = computed(() => creds.value?.fullUrl.replace(/\/stream.*$/, '/dashboard') ?? '#');

onMounted(() => {
  void fetchData();
  void fetchMusic();
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
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div :class="['card border-2 sm:col-span-2 lg:col-span-2 transition-all duration-500', liveState.isLive ? 'border-red-500/60 bg-red-500/5' : 'border-emerald-500/30']">
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

      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 space-y-6">
          <div v-if="np.current" class="card">
            <div class="min-w-0">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Sonando ahora</div>
              <div class="text-lg font-bold truncate">{{ np.current.title }}</div>
              <div class="text-slate-400 truncate">{{ np.current.artist }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ np.current.album }}</div>
            </div>
          </div>

          <div class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Controles</h2>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" :disabled="actionLoading === 'skip'" class="btn text-sm justify-center" @click="postAction('skip', 'Saltar canción')">
                <span v-if="actionLoading === 'skip'" class="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-300 animate-spin" />
                <span v-else>Saltar canción</span>
              </button>
              <button type="button" :disabled="actionLoading === 'stop-autodj'" class="btn text-sm justify-center bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 ring-1 ring-amber-500/30" @click="postAction('stop-autodj', 'Pausar AutoDJ')">
                <span v-if="actionLoading === 'stop-autodj'" class="h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-300 animate-spin" />
                <span v-else>Pausar AutoDJ</span>
              </button>
              <button type="button" :disabled="actionLoading === 'restart-autodj'" class="btn text-sm justify-center bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30" @click="postAction('restart-autodj', 'Reiniciar AutoDJ')">
                <span v-if="actionLoading === 'restart-autodj'" class="h-4 w-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-300 animate-spin" />
                <span v-else>Reiniciar AutoDJ</span>
              </button>
              <button type="button" :disabled="actionLoading === 'disconnect'" class="btn text-sm justify-center bg-red-500/15 text-red-300 hover:bg-red-500/25 ring-1 ring-red-500/30" @click="postAction('disconnect', 'Desconectar DJ')">
                <span v-if="actionLoading === 'disconnect'" class="h-4 w-4 rounded-full border-2 border-red-400/30 border-t-red-300 animate-spin" />
                <span v-else>Desconectar DJ</span>
              </button>
            </div>
          </div>

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

        <div class="space-y-6">
          <div v-if="creds" class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Conexión DJ</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">Servidor</dt>
                <dd class="text-slate-200 font-mono text-xs">{{ creds.host }}:{{ creds.port }}</dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-slate-500 shrink-0">Mountpoint</dt>
                <dd class="text-slate-200 font-mono truncate">{{ creds.mountpoint }}</dd>
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
              <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition" @click="lastCopied = 'url'; copy(creds.host + ':' + creds.port + creds.mountpoint)">{{ copied && lastCopied === 'url' ? 'Copiada' : 'Copiar URL' }}</button>
            </div>
          </div>

          <div class="card">
            <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-3">Azuracast</h2>
            <p class="text-xs text-slate-400 mb-3">Subir archivos, crear playlists.</p>
            <a :href="azuracastUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 ring-1 ring-brand-500/30 transition">
              Abrir Azuracast
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Música: biblioteca + subir -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <h2 class="font-semibold text-sm uppercase tracking-wider text-slate-500">Biblioteca</h2>
          <div class="flex-1" />
          <label :class="['inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition', uploading ? 'bg-slate-800 text-slate-400' : 'bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 ring-1 ring-brand-500/30']">
            <span v-if="uploading" class="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-300 animate-spin" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M12 3a.75.75 0 01.75.75v7.5h7.5a.75.75 0 010 1.5h-7.5v7.5a.75.75 0 01-1.5 0v-7.5h-7.5a.75.75 0 010-1.5h7.5v-7.5A.75.75 0 0112 3z" clip-rule="evenodd"/></svg>
            {{ uploading ? 'Subiendo...' : 'Subir MP3' }}
            <input type="file" accept="audio/mpeg,.mp3" class="hidden" :disabled="uploading" @change="doUpload" />
          </label>
          <select v-model="selectedPlaylist" class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option :value="null" disabled>Playlist...</option>
            <option v-for="pl in playlists" :key="pl.id" :value="pl.id">{{ pl.name }}</option>
          </select>
          <button type="button" :disabled="!selectedPlaylist || selectedMusic.size === 0" class="px-4 py-2 rounded-lg text-sm bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 ring-1 ring-emerald-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed" @click="addToPlaylist">
            Agregar ({{ selectedMusic.size }})
          </button>
          <button v-if="selectedMusic.size > 0" type="button" class="px-4 py-2 rounded-lg text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30 ring-1 ring-red-500/30 transition" @click="doDeleteSelected">
            Eliminar
          </button>
        </div>

        <div v-if="musicMsg" class="mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-300 text-sm rounded-lg ring-1 ring-emerald-500/20">{{ musicMsg }}</div>

        <input v-model="musicSearch" type="text" placeholder="Buscar..." class="w-full mb-4 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600" />

        <div v-if="filteredMusic.length === 0" class="text-sm text-slate-500 text-center py-8">No hay archivos. Sube tu primer MP3.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 text-left text-slate-500 text-xs uppercase tracking-wider">
                <th class="py-3 px-3 w-10"><input type="checkbox" :checked="selectedMusic.size === filteredMusic.length && filteredMusic.length > 0" @change="selectAll" class="accent-brand-500" /></th>
                <th class="py-3 px-3">Nombre</th>
                <th class="py-3 px-3 hidden sm:table-cell">Tamaño</th>
                <th class="py-3 px-3 w-24" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in filteredMusic" :key="f.id" :class="['border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors', selectedMusic.has(f.id) ? 'bg-brand-500/5' : '']">
                <td class="py-2.5 px-3"><input type="checkbox" :checked="selectedMusic.has(f.id)" @change="toggleSelect(f.id)" class="accent-brand-500" /></td>
                <td class="py-2.5 px-3">
                  <div class="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">{{ f.name }}</div>
                </td>
                <td class="py-2.5 px-3 text-slate-400 hidden sm:table-cell">{{ fmtSize(f.size) }}</td>
                <td class="py-2.5 px-3">
                  <button type="button" class="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition" @click="doDeleteMusic(f.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-400 p-3 bg-red-500/10 rounded-lg ring-1 ring-red-500/20">
        {{ error }}
      </div>
    </template>
  </div>
</template>
