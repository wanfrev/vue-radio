<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="card text-center py-12">
    <h1 class="text-3xl font-bold mb-2">404</h1>
    <p class="text-slate-400 mb-4">La página que buscas no existe.</p>
    <RouterLink to="/" class="btn-primary inline-flex">Volver al inicio</RouterLink>
  </section>
</template>
