<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <header class="sticky top-0 z-30 backdrop-blur bg-slate-950/70 border-b border-slate-800">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 group">
        <span class="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white font-bold">R</span>
        <span class="font-semibold tracking-wide group-hover:text-white text-slate-100">Radio</span>
      </RouterLink>

      <nav class="flex items-center gap-1 sm:gap-2 text-sm">
        <RouterLink to="/"         class="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60" active-class="text-white bg-slate-800" :exact-active-class="'text-white bg-slate-800'">Inicio</RouterLink>
        <RouterLink to="/history"  class="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60" active-class="text-white bg-slate-800">Historial</RouterLink>
        <RouterLink to="/schedule" class="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60" active-class="text-white bg-slate-800">Programación</RouterLink>
        <RouterLink to="/donar"    class="px-3 py-1.5 rounded-full text-rose-300 hover:text-rose-200 hover:bg-slate-800/60" active-class="text-rose-200 bg-slate-800">Donar</RouterLink>
        <RouterLink to="/contact"  class="px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60" active-class="text-white bg-slate-800">Contacto</RouterLink>
      </nav>
    </div>
  </header>
</template>
