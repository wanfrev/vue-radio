<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const mobileOpen = ref(false);

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/estudio', label: 'Estudio' },
  { to: '/admin/donations', label: 'Donaciones' },
];

function isActive(path: string): boolean {
  return route.path === path;
}

async function handleLogout(): Promise<void> {
  mobileOpen.value = false;
  await auth.logout();
  router.push('/admin/login');
}

function closeMobile(): void {
  mobileOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Top navbar -->
    <header class="fixed top-0 inset-x-0 z-40 h-16 bg-slate-950 border-b border-slate-800">
      <div class="h-full flex items-center px-4 gap-4">
        <RouterLink to="/admin/dashboard" class="flex items-center gap-2 shrink-0" @click="closeMobile">
          <span class="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 text-white text-xs font-bold">R</span>
          <span class="font-semibold text-sm tracking-wide hidden sm:inline">Admin</span>
        </RouterLink>

        <div class="hidden md:flex items-center gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
            ]"
          >
            {{ item.label }}
          </RouterLink>
        </div>

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

        <button
          type="button"
          class="md:hidden text-slate-400 hover:text-white p-1"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <nav
        v-if="mobileOpen"
        class="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
          ]"
          @click="closeMobile"
        >
          {{ item.label }}
        </RouterLink>
        <button
          type="button"
          class="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors sm:hidden"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </nav>
    </header>

    <!-- Main content -->
    <main style="padding-top: 4rem" class="p-4 sm:p-6 lg:p-8">
      <RouterView />
    </main>
  </div>
</template>
