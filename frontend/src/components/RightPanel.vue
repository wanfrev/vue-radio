<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { usePlayerStore } from '@/stores/player';
import { useClipboard } from '@/composables/useClipboard';
import LiveStatusBadge from '@/components/admin/LiveStatusBadge.vue';
import { RouterLink } from 'vue-router';

type Tab = 'now' | 'history' | 'donate' | 'contact' | 'schedule';

const np = useNowPlayingStore();
const player = usePlayerStore();
const active = ref<Tab>('now');
const { copied: copyState, copy } = useClipboard();
let lastCopiedId = -1;

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyClabe(id: number, clabe: string): void {
  lastCopiedId = id; copy(clabe);
}

const donations = [
  { id: 1, bank: 'BBVA', holder: 'Nombre del titular', clabe: '012345678901234567', account: '1234567890', type: 'Ahorro' },
  { id: 2, bank: 'Santander', holder: 'Nombre del titular', clabe: '098765432109876543', account: '0987654321', type: 'Cheques' },
];

const schedule = [
  { time: '06:00 – 10:00', show: 'Mañanas en vivo', host: 'Equipo de la casa' },
  { time: '10:00 – 14:00', show: 'Bloque mediodía', host: 'AutoDJ' },
  { time: '14:00 – 18:00', show: 'Tarde continua', host: 'AutoDJ' },
  { time: '18:00 – 22:00', show: 'Hora pico', host: 'Locutores rotativos' },
  { time: '22:00 – 06:00', show: 'Madrugada', host: 'AutoDJ' },
];

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'now', label: 'AHORA', icon: '▶' },
  { key: 'history', label: 'HISTORIAL', icon: '⏱' },
  { key: 'donate', label: 'DONAR', icon: '♡' },
  { key: 'contact', label: 'CONTACTO', icon: '@' },
  { key: 'schedule', label: 'PROGRAMACIÓN', icon: '☰' },
];
</script>

<template>
  <div class="glass-strong rounded-2xl sm:rounded-3xl h-full min-h-[400px] md:min-h-0 flex flex-col overflow-hidden">
    <!-- Tabs -->
    <div class="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-white/10 overflow-x-auto shrink-0">
      <button
        v-for="tab in tabs" :key="tab.key" type="button"
        :class="['text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 font-medium',
          active === tab.key
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/5',
          tab.key === 'donate' && active === tab.key
            ? 'bg-fuchsia-500/30 shadow-[0_0_8px_rgba(244,114,182,0.3)]'
            : active === tab.key
              ? 'bg-cyber-cyan/20 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
              : '']"
        @click="active = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-5">
      <!-- NOW PLAYING -->
      <template v-if="active === 'now'">
        <div v-if="np.current" class="space-y-5">
          <LiveStatusBadge
            v-if="np.current?.isLive"
            :is-live="true" :streamer-name="np.current.liveStreamerName ?? null" :pulse="true"
          />
          <div v-else class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full" :style="{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }" />
            <span class="label-cyber">EN VIVO</span>
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-1" style="font-family: 'Space Grotesk', system-ui, sans-serif;">{{ np.current.title }}</h2>
            <p class="text-slate-300 text-lg">{{ np.current.artist }}</p>
            <p v-if="np.current.album" class="text-sm text-slate-500 mt-1">{{ np.current.album }}</p>
          </div>

          <div class="h-px bg-white/10" />

          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="label-cyber mb-1">Oyentes</div>
              <div class="text-3xl font-bold tabular-nums neon-text">{{ np.current.listeners }}</div>
            </div>
            <div v-if="np.history[0]">
              <div class="label-cyber-pink mb-1">Siguiente</div>
              <div class="text-sm text-slate-200 truncate">{{ np.history[0].title }}</div>
              <div class="text-xs text-slate-500 truncate">{{ np.history[0].artist }}</div>
            </div>
          </div>
        </div>
        <p v-else class="text-slate-500 text-sm">Esperando transmisión…</p>
      </template>

      <!-- HISTORY -->
      <template v-else-if="active === 'history'">
        <ul v-if="np.history.length" class="space-y-1">
          <li
            v-for="(item, i) in np.history" :key="`${item.startedAt}-${i}`"
            class="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
            :style="{ opacity: Math.max(0.3, 1 - i * 0.12) }"
          >
            <div class="h-10 w-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
              <img v-if="item.art" :src="item.art" :alt="item.title" class="h-full w-full object-cover" />
              <div v-else class="h-full w-full grid place-items-center text-xs text-white bg-gradient-to-br from-cyber-cyan to-cyber-purple">♪</div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm text-slate-100">{{ item.title }}</div>
              <div class="truncate text-xs text-slate-500">{{ item.artist }}</div>
            </div>
            <div class="text-[10px] text-slate-600 tabular-nums shrink-0">{{ fmtTime(item.startedAt) }}</div>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">Aún no hay canciones en el historial.</p>
      </template>

      <!-- DONATE -->
      <template v-else-if="active === 'donate'">
        <p class="text-sm text-slate-300 leading-relaxed mb-4">Si disfrutas la radio, considera apoyarnos con una donación.</p>
        <div class="space-y-3">
          <div
            v-for="acc in donations" :key="acc.id"
            class="rounded-xl p-4" style="background: linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(168,85,247,0.06) 100%); border: 1px solid rgba(34,211,238,0.1);"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-sm text-slate-100">{{ acc.bank }}</span>
              <span class="text-[10px] text-slate-500 uppercase">{{ acc.type }}</span>
            </div>
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Titular</div>
            <div class="text-sm text-slate-200 mb-2">{{ acc.holder }}</div>
            <div class="text-[10px] text-slate-500 uppercase tracking-wider mb-1">CLABE</div>
            <div class="flex items-center gap-2">
              <code class="font-mono text-sm text-cyber-cyan tabular-nums">{{ acc.clabe }}</code>
              <button type="button" class="text-[10px] px-2 py-1 rounded-full bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 transition"
                @click="copyClabe(acc.id, acc.clabe)"
              >{{ copyState && lastCopiedId === acc.id ? '¡Copiado!' : 'Copiar' }}</button>
            </div>
          </div>
        </div>
      </template>

      <!-- CONTACT -->
      <template v-else-if="active === 'contact'">
        <p class="text-sm text-slate-300 leading-relaxed mb-4">Peticiones, saludos o reporte de problemas técnicos.</p>
        <form class="space-y-3" @submit.prevent>
          <input type="text" placeholder="Nombre" class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40" />
          <input type="email" placeholder="Email" class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40" />
          <textarea rows="3" placeholder="Mensaje" class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/40 resize-none"></textarea>
          <button type="submit" class="btn-primary w-full text-sm">Enviar</button>
        </form>
      </template>

      <!-- SCHEDULE -->
      <template v-else-if="active === 'schedule'">
        <ul class="space-y-1">
          <li v-for="slot in schedule" :key="slot.time" class="py-2 border-b border-white/5 last:border-0">
            <div class="text-xs text-cyber-cyan tabular-nums">{{ slot.time }}</div>
            <div class="text-sm text-slate-100">{{ slot.show }}</div>
            <div class="text-xs text-slate-500">{{ slot.host }}</div>
          </li>
        </ul>
      </template>
    </div>

    <!-- Admin link -->
    <div class="px-4 py-2 border-t border-white/10 shrink-0">
      <RouterLink to="/admin" class="text-xs text-slate-400 hover:text-cyber-cyan transition tracking-wider uppercase inline-flex items-center gap-1">
        <span class="h-1.5 w-1.5 rounded-full bg-cyber-cyan/60" /> Admin
      </RouterLink>
    </div>
  </div>
</template>
