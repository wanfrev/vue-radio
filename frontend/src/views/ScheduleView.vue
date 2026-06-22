<script setup lang="ts">
interface Slot {
  day: string;
  time: string;
  show: string;
  host: string;
}

const schedule: Slot[] = [
  { day: 'Lunes a Viernes', time: '06:00 – 10:00', show: 'Mañanas en vivo',   host: 'Equipo de la casa' },
  { day: 'Lunes a Viernes', time: '10:00 – 14:00', show: 'Bloque mediodía',   host: 'Selección automática' },
  { day: 'Lunes a Viernes', time: '14:00 – 18:00', show: 'Tarde continua',    host: 'Selección automática' },
  { day: 'Lunes a Viernes', time: '18:00 – 22:00', show: 'Hora pico',         host: 'Locutores rotativos' },
  { day: 'Lunes a Viernes', time: '22:00 – 06:00', show: 'Madrugada',         host: 'Selección automática' },
  { day: 'Sábado y Domingo', time: '00:00 – 24:00', show: 'Maratón fin de semana', host: 'Selección automática' },
];
</script>

<template>
  <section>
    <header class="mb-5">
      <h1 class="text-2xl font-bold">Programación</h1>
      <p class="text-slate-400 text-sm">Estos horarios son referenciales. La radio suena 24/7.</p>
    </header>

    <ul class="card divide-y divide-slate-800 p-0 overflow-hidden">
      <li v-for="slot in schedule" :key="`${slot.day}-${slot.time}`" class="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <div class="text-sm text-slate-400 sm:w-48">{{ slot.day }}</div>
        <div class="text-sm tabular-nums text-slate-300 sm:w-40">{{ slot.time }}</div>
        <div class="flex-1 font-medium">{{ slot.show }}</div>
        <div class="text-sm text-slate-400">{{ slot.host }}</div>
      </li>
    </ul>
  </section>
</template>
