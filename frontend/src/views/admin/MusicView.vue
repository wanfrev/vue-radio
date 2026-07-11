<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';

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

const files = ref<AzFile[]>([]);
const playlists = ref<AzPlaylist[]>([]);
const loading = ref(true);
const uploading = ref(false);
const error = ref<string | null>(null);
const search = ref('');
const selectedFiles = ref<Set<number>>(new Set());
const selectedPlaylist = ref<number | null>(null);
const actionMsg = ref<string | null>(null);

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return files.value.filter((f) => f.name.toLowerCase().includes(q));
});

function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function fetchAll(): Promise<void> {
  loading.value = true;
  try {
    const [fr, pr] = await Promise.all([
      fetch('/api/admin/music/files', { credentials: 'include', headers: { Accept: 'application/json' } }),
      fetch('/api/admin/music/playlists', { credentials: 'include', headers: { Accept: 'application/json' } }),
    ]);
    if (fr.ok) {
      const d = await fr.json();
      files.value = (d.files as AzFile[]) ?? [];
    }
    if (pr.ok) {
      const d = await pr.json();
      playlists.value = (d.playlists as AzPlaylist[]) ?? [];
    }
    error.value = null;
  } catch (e) {
    error.value = 'Error al cargar datos';
  } finally {
    loading.value = false;
  }
}

function toggleSelect(id: number): void {
  const s = selectedFiles.value;
  if (s.has(id)) s.delete(id);
  else s.add(id);
  selectedFiles.value = new Set(s);
}

function selectAll(): void {
  if (selectedFiles.value.size === filtered.value.length) {
    selectedFiles.value = new Set();
  } else {
    selectedFiles.value = new Set(filtered.value.map((f) => f.id));
  }
}

async function doUpload(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploading.value = true;
  error.value = null;
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/music/upload', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    await fetchAll();
    input.value = '';
  } catch (e) {
    error.value = 'Error al subir archivo';
  } finally {
    uploading.value = false;
  }
}

async function doDelete(id: number): Promise<void> {
  if (!confirm('¿Eliminar este archivo?')) return;
  try {
    const res = await fetch(`/api/admin/music/file/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Delete failed');
    await fetchAll();
  } catch {
    error.value = 'Error al eliminar';
  }
}

async function doDeleteSelected(): Promise<void> {
  if (selectedFiles.value.size === 0) return;
  if (!confirm(`¿Eliminar ${selectedFiles.value.size} archivos?`)) return;
  for (const id of selectedFiles.value) {
    await fetch(`/api/admin/music/file/${id}`, { method: 'DELETE', credentials: 'include' });
  }
  selectedFiles.value = new Set();
  await fetchAll();
}

async function addToPlaylist(): Promise<void> {
  if (!selectedPlaylist.value || selectedFiles.value.size === 0) return;
  try {
    const res = await fetch(`/api/admin/music/playlist/${selectedPlaylist.value}/add`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: [...selectedFiles.value] }),
    });
    if (!res.ok) throw new Error('Failed');
    const pl = playlists.value.find((p) => p.id === selectedPlaylist.value);
    actionMsg.value = `${selectedFiles.value.size} canciones agregadas a "${pl?.name ?? ''}"`;
    selectedFiles.value = new Set();
    setTimeout(() => (actionMsg.value = null), 3000);
  } catch {
    error.value = 'Error al agregar a playlist';
  }
}

async function removeFromPlaylist(id: number): Promise<void> {
  if (!selectedPlaylist.value) return;
  try {
    const res = await fetch(`/api/admin/music/playlist/${selectedPlaylist.value}/remove`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: [id] }),
    });
    if (!res.ok) throw new Error('Failed');
    await fetchAll();
  } catch {
    error.value = 'Error al quitar de playlist';
  }
}

onMounted(() => fetchAll());
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">Música</h1>
    <p class="text-slate-400 text-sm mb-6">
      {{ files.length }} archivos en la biblioteca
    </p>

    <div v-if="loading" class="text-sm text-slate-400">Cargando…</div>

    <template v-else>
      <!-- Actions bar -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <label
          :class="[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition',
            uploading
              ? 'bg-slate-800 text-slate-400'
              : 'bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 ring-1 ring-brand-500/30',
          ]"
        >
          <span v-if="uploading" class="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-300 animate-spin" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
            <path fill-rule="evenodd" d="M12 3a.75.75 0 01.75.75v7.5h7.5a.75.75 0 010 1.5h-7.5v7.5a.75.75 0 01-1.5 0v-7.5h-7.5a.75.75 0 010-1.5h7.5v-7.5A.75.75 0 0112 3z" clip-rule="evenodd" />
          </svg>
          {{ uploading ? 'Subiendo...' : 'Subir MP3' }}
          <input type="file" accept="audio/mpeg,.mp3" class="hidden" :disabled="uploading" @change="doUpload" />
        </label>

        <div class="flex-1" />

        <select
          v-model="selectedPlaylist"
          class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option :value="null" disabled>Seleccionar playlist...</option>
          <option v-for="pl in playlists" :key="pl.id" :value="pl.id">
            {{ pl.name }} {{ pl.is_enabled ? '' : '(inactiva)' }}
          </option>
        </select>

        <button
          type="button"
          :disabled="!selectedPlaylist || selectedFiles.size === 0"
          class="px-4 py-2 rounded-lg text-sm bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 ring-1 ring-emerald-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
          @click="addToPlaylist"
        >
          Agregar a playlist
        </button>

        <button
          v-if="selectedFiles.size > 0"
          type="button"
          class="px-4 py-2 rounded-lg text-sm bg-red-600/20 text-red-300 hover:bg-red-600/30 ring-1 ring-red-500/30 transition"
          @click="doDeleteSelected"
        >
          Eliminar ({{ selectedFiles.size }})
        </button>
      </div>

      <div v-if="actionMsg" class="mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-300 text-sm rounded-lg ring-1 ring-emerald-500/20">
        {{ actionMsg }}
      </div>

      <div v-if="error" class="mb-4 px-4 py-2 bg-red-500/10 text-red-300 text-sm rounded-lg ring-1 ring-red-500/20">
        {{ error }}
      </div>

      <!-- Search -->
      <input
        v-model="search"
        type="text"
        placeholder="Buscar canción..."
        class="w-full mb-4 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
      />

      <!-- File list -->
      <div class="card overflow-hidden">
        <div v-if="filtered.length === 0" class="text-sm text-slate-500 text-center py-8">
          No se encontraron archivos.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-800 text-left text-slate-500 text-xs uppercase tracking-wider">
              <th class="py-3 px-3 w-10">
                <input
                  type="checkbox"
                  :checked="selectedFiles.size === filtered.length && filtered.length > 0"
                  @change="selectAll"
                  class="accent-brand-500"
                />
              </th>
              <th class="py-3 px-3">Nombre</th>
              <th class="py-3 px-3 hidden sm:table-cell">Tamaño</th>
              <th class="py-3 px-3 hidden md:table-cell">Playlist</th>
              <th class="py-3 px-3 w-24" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in filtered"
              :key="f.id"
              :class="[
                'border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors',
                selectedFiles.has(f.id) ? 'bg-brand-500/5' : '',
              ]"
            >
              <td class="py-2.5 px-3">
                <input
                  type="checkbox"
                  :checked="selectedFiles.has(f.id)"
                  @change="toggleSelect(f.id)"
                  class="accent-brand-500"
                />
              </td>
              <td class="py-2.5 px-3">
                <div class="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">{{ f.name }}</div>
                <div class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">{{ f.path }}</div>
              </td>
              <td class="py-2.5 px-3 text-slate-400 hidden sm:table-cell">{{ fmtSize(f.size) }}</td>
              <td class="py-2.5 px-3 hidden md:table-cell">
                <select
                  class="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                  @change="(e) => { selectedPlaylist = Number((e.target as HTMLSelectElement).value); addToPlaylist(); }"
                >
                  <option value="">Agregar a...</option>
                  <option v-for="pl in playlists" :key="pl.id" :value="pl.id">{{ pl.name }}</option>
                </select>
              </td>
              <td class="py-2.5 px-3">
                <button
                  type="button"
                  class="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition"
                  @click="doDelete(f.id)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
