<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <header class="fixed top-0 inset-x-0 z-30">
    <div class="absolute inset-0"
      style="background: linear-gradient(180deg, rgba(5,5,20,0.7) 0%, rgba(5,5,20,0.3) 70%, transparent 100%);
        backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid rgba(34,211,238,0.08);" />
    <div class="relative max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <span class="h-8 w-8 rounded-lg grid place-items-center text-white font-bold text-sm"
          style="background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); box-shadow: 0 0 16px rgba(34,211,238,0.4);">R</span>
        <span class="font-semibold tracking-wide text-slate-100">Radio</span>
      </RouterLink>
      <nav class="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
        <RouterLink to="/" class="px-2.5 sm:px-3 py-1.5 rounded-full text-slate-300 hover:text-white transition-all duration-200" active-class="text-cyber-cyan">Inicio</RouterLink>
        <RouterLink to="/history" class="px-2.5 sm:px-3 py-1.5 rounded-full text-slate-300 hover:text-white transition-all duration-200" active-class="text-cyber-cyan">Historial</RouterLink>
        <RouterLink to="/schedule" class="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 rounded-full text-slate-300 hover:text-white transition-all duration-200" active-class="text-cyber-cyan">Programación</RouterLink>
        <RouterLink to="/donar" class="px-2.5 sm:px-3 py-1.5 rounded-full text-slate-300 hover:text-fuchsia-300 transition-all duration-200" active-class="text-fuchsia-300">Donar</RouterLink>
        <RouterLink to="/contact" class="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 rounded-full text-slate-300 hover:text-white transition-all duration-200" active-class="text-cyber-cyan">Contacto</RouterLink>
      </nav>
    </div>
  </header>
</template>
