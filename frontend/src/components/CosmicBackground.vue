<script setup lang="ts">
import bgUrl from '@/assets/background.png';
</script>

<template>
  <div class="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgUrl})` }"
    />
  </div>
</template>
