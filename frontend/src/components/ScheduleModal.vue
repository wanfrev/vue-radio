<script setup lang="ts">
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();

const schedule = [
  { time: '06:00 – 10:00', show: 'Mañanas en vivo', host: 'Equipo de la casa' },
  { time: '10:00 – 14:00', show: 'Bloque mediodía', host: 'AutoDJ' },
  { time: '14:00 – 18:00', show: 'Tarde continua', host: 'AutoDJ' },
  { time: '18:00 – 22:00', show: 'Hora pico', host: 'Locutores rotativos' },
  { time: '22:00 – 06:00', show: 'Madrugada', host: 'AutoDJ' },
];
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.activeModal === 'schedule'" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="ui.close()">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Programación</h2>
          <button type="button" class="text-slate-400 hover:text-white p-1" @click="ui.close()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          </button>
        </div>

        <p class="text-xs text-slate-500 mb-4 rounded-lg bg-slate-800/50 px-3 py-2 border border-slate-800">
          Horarios de nuestra programación semanal (UTC-6).
        </p>

        <ul class="space-y-0.5">
          <li v-for="slot in schedule" :key="slot.time" class="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0">
            <div>
              <div class="text-sm font-medium text-slate-100">{{ slot.show }}</div>
              <div class="text-xs text-slate-500">{{ slot.host }}</div>
            </div>
            <div class="text-xs text-cyan-400 font-mono tabular-nums shrink-0 ml-3">{{ slot.time }}</div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>