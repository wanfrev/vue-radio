<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <header class="fixed top-0 inset-x-0 z-30 h-11 bg-slate-950 border-b border-slate-800">
    <div class="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
      <RouterLink to="/admin/login" class="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider">
        Admin
      </RouterLink>
      <nav class="flex items-center gap-1">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full text-xs font-medium text-fuchsia-300 hover:text-fuchsia-200 hover:bg-fuchsia-500/10 transition-colors"
          @click="ui.toggle('donate')"
        >
          Donar
        </button>
      </nav>
    </div>
  </header>
</template>