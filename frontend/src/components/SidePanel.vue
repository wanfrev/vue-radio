<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useSidePanelStore } from '@/stores/sidePanel';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { useClipboard } from '@/composables/useClipboard';

const panel = useSidePanelStore();
const np = useNowPlayingStore();
const { copied: copyState, copy } = useClipboard();
let lastCopiedId = -1;

function copyClabe(id: number, clabe: string): void { lastCopiedId = id; copy(clabe); }
function fmtTime(ts: number): string { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function onKeydown(e: KeyboardEvent): void { if (e.key === 'Escape') panel.close(); }

watch(() => panel.open, (v) => { document.body.style.overflow = v ? 'hidden' : ''; });
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => { window.removeEventListener('keydown', onKeydown); document.body.style.overflow = ''; });
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="panel.open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="panel.close()">
        <div class="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-slate-900 ring-1 ring-slate-800 shadow-2xl px-5 py-6 sm:p-6"
          style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0))" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-100">
              {{ panel.active === 'now' ? 'En vivo' : panel.active === 'history' ? 'Historial' : panel.active === 'donate' ? 'Donar' : panel.active === 'contact' ? 'Contacto' : 'Programación' }}
            </h2>
            <button type="button" class="text-slate-400 hover:text-white transition p-1" @click="panel.close()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
            </button>
          </div>

          <!-- HISTORY -->
          <template v-if="panel.active === 'history'">
            <ul v-if="np.history.length" class="space-y-2">
              <li v-for="(item, i) in np.history" :key="`${item.startedAt}-${i}`" class="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0" :style="{ opacity: Math.max(0.3, 1 - i * 0.1) }">
                <div class="h-10 w-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-700">
                  <img v-if="item.art" :src="item.art" :alt="item.title" class="h-full w-full object-cover" />
                  <div v-else class="h-full w-full grid place-items-center text-xs text-white" style="background: linear-gradient(135deg, #22d3ee, #a855f7);">♪</div>
                </div>
                <div class="min-w-0 flex-1"><div class="truncate text-sm text-slate-100">{{ item.title }}</div><div class="truncate text-xs text-slate-500">{{ item.artist }}</div></div>
                <div class="text-[10px] text-slate-600 tabular-nums">{{ fmtTime(item.startedAt) }}</div>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500">Aún no hay historial.</p>
          </template>

          <!-- DONATE -->
          <template v-else-if="panel.active === 'donate'">
            <p class="text-sm text-slate-400 mb-4">Si disfrutas la radio, considera apoyarnos.</p>
            <div class="space-y-3">
              <div v-for="acc in [{id:1,bank:'BBVA',holder:'Nombre del titular',clabe:'012345678901234567',account:'1234567890',type:'Ahorro'},{id:2,bank:'Santander',holder:'Nombre del titular',clabe:'098765432109876543',account:'0987654321',type:'Cheques'}]" :key="acc.id"
                class="rounded-xl p-4" style="background: linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(168,85,247,0.06) 100%); border: 1px solid rgba(34,211,238,0.1);">
                <div class="flex items-center justify-between mb-2"><span class="font-semibold text-sm text-slate-100">{{ acc.bank }}</span><span class="text-xs text-slate-500">{{ acc.type }}</span></div>
                <div class="text-xs text-slate-400 mb-1">Titular</div><div class="text-sm text-slate-200 mb-2">{{ acc.holder }}</div>
                <div class="text-xs text-slate-400 mb-1">CLABE</div>
                <div class="flex items-center gap-2">
                  <code class="font-mono text-sm text-cyber-cyan tabular-nums">{{ acc.clabe }}</code>
                  <button type="button" class="text-xs px-2 py-1 rounded bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 transition" @click="copyClabe(acc.id, acc.clabe)">{{ copyState && lastCopiedId === acc.id ? '¡Copiado!' : 'Copiar' }}</button>
                </div>
              </div>
            </div>
          </template>

          <!-- CONTACT -->
          <template v-else-if="panel.active === 'contact'">
            <p class="text-sm text-slate-400 mb-4">Peticiones, saludos o reporte de problemas.</p>
            <form class="space-y-3" @submit.prevent>
              <input type="text" placeholder="Nombre" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40" />
              <input type="email" placeholder="Email" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40" />
              <textarea rows="4" placeholder="Mensaje" class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40 resize-none"></textarea>
              <button type="submit" class="btn-primary w-full text-sm">Enviar</button>
            </form>
          </template>

          <!-- SCHEDULE -->
          <template v-else-if="panel.active === 'schedule'">
            <ul class="space-y-2">
              <li v-for="slot in [{time:'06:00–10:00',show:'Mañanas en vivo',host:'Equipo'},{time:'10:00–14:00',show:'Bloque mediodía',host:'AutoDJ'},{time:'14:00–18:00',show:'Tarde continua',host:'AutoDJ'},{time:'18:00–22:00',show:'Hora pico',host:'Locutores'},{time:'22:00–06:00',show:'Madrugada',host:'AutoDJ'}]" :key="slot.time"
                class="py-2 border-b border-slate-800 last:border-0">
                <div class="text-xs text-cyber-cyan tabular-nums">{{ slot.time }}</div>
                <div class="text-sm text-slate-100">{{ slot.show }}</div>
                <div class="text-xs text-slate-500">{{ slot.host }}</div>
              </li>
            </ul>
          </template>

          <!-- NOW (default) -->
          <template v-else>
            <div v-if="np.current" class="space-y-3">
              <div class="text-xs text-slate-500 uppercase tracking-wider">Oyentes</div>
              <div class="text-2xl font-bold tabular-nums neon-text">{{ np.current.listeners }}</div>
              <div class="h-px bg-slate-800" />
              <div class="text-xs text-slate-500 uppercase tracking-wider">Fuente</div>
              <div class="text-xs font-mono text-slate-300">{{ np.current.art ? 'iTunes Cover Art' : 'Sin carátula' }}</div>
            </div>
            <p v-else class="text-sm text-slate-500">Esperando transmisión…</p>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-enter-active { transition: opacity 0.25s ease; }
.modal-enter-active > * { transition: transform 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-leave-active > * { transition: transform 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from > * { transform: translateY(1rem); }
.modal-leave-to { opacity: 0; }
.modal-leave-to > * { transform: translateY(1rem); }
</style>
