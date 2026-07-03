<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const mobileOpen = ref(false);

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    to: '/admin/donations',
    label: 'Donaciones',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    to: '/admin/studio',
    label: 'Estudio',
    icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2',
  },
];

function isActive(path: string): boolean {
  if (path === '/admin/studio') {
    return route.path === '/admin/studio' || route.path === '/admin/studio/guide';
  }
  return route.path === path;
}

async function handleLogout(): Promise<void> {
  mobileOpen.value = false;
  await auth.logout();
  router.push('/admin/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Overlay mobile -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/60 md:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar desktop + mobile drawer -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-slate-900 border-r border-slate-800 transition-transform md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex items-center justify-between h-14 px-4 border-b border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <span class="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 text-white text-xs font-bold">R</span>
          <span class="font-semibold text-sm tracking-wide">Admin</span>
        </RouterLink>
        <button
          type="button"
          class="md:hidden text-slate-400 hover:text-white p-1"
          @click="mobileOpen = false"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
          ]"
          @click="mobileOpen = false"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0">
            <path :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>

        <div v-if="route.path.startsWith('/admin/studio')" class="pt-2 mt-2 border-t border-slate-800">
          <RouterLink
            to="/admin/studio/guide"
            :class="[
              'flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-xs font-medium transition-colors',
              route.path === '/admin/studio/guide'
                ? 'bg-slate-800/60 text-cyan-300'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40',
            ]"
            @click="mobileOpen = false"
          >
            Manual del Locutor
          </RouterLink>
        </div>
      </nav>

      <div class="p-3 border-t border-slate-800">
        <div class="flex items-center gap-2 mb-2">
          <span class="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
            {{ auth.user?.username?.charAt(0).toUpperCase() }}
          </span>
          <span class="text-xs text-slate-400 truncate">{{ auth.user?.username }}</span>
        </div>
        <button
          type="button"
          class="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="md:pl-60 flex flex-col min-h-screen">
      <!-- Top bar -->
      <header class="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <button
          type="button"
          class="md:hidden text-slate-400 hover:text-white p-1 -ml-1"
          @click="mobileOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class="flex-1" />
        <button
          type="button"
          class="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
          @click="handleLogout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5">
            <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clip-rule="evenodd" />
          </svg>
          Salir
        </button>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>