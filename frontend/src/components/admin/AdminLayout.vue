<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout(): Promise<void> {
  await auth.logout();
  router.push('/admin/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex">
    <!-- Sidebar -->
    <aside class="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-800 bg-slate-950/80">
      <div class="px-4 h-14 flex items-center border-b border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2 text-slate-300 hover:text-white transition">
          <span class="h-6 w-6 rounded bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white text-xs font-bold">R</span>
          <span class="font-semibold text-sm">Admin</span>
        </RouterLink>
      </div>

      <nav class="flex-1 p-3 space-y-1">
        <RouterLink
          to="/admin/dashboard"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          active-class="text-white bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 shrink-0">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          Dashboard
        </RouterLink>
        <RouterLink
          to="/admin/donations"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          active-class="text-white bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 shrink-0">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          Donaciones
        </RouterLink>
        <RouterLink
          to="/admin/live"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          active-class="text-white bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 shrink-0">
            <path d="M8 5v14l11-7z" />
          </svg>
          En Vivo
        </RouterLink>
      </nav>

      <div class="p-3 border-t border-slate-800">
        <div class="text-xs text-slate-500 mb-2 truncate" :title="auth.user?.username">
          {{ auth.user?.username }}
        </div>
        <button
          type="button"
          class="text-xs text-slate-400 hover:text-white transition"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Mobile header + content -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="md:hidden h-12 flex items-center justify-between px-4 border-b border-slate-800">
        <span class="font-semibold text-sm">Admin</span>
        <div class="flex items-center gap-2">
          <RouterLink
            to="/admin/dashboard"
            class="text-xs px-2 py-1 rounded text-slate-300 hover:bg-slate-800"
            active-class="text-white bg-slate-800"
          >Dashboard</RouterLink>
          <RouterLink
            to="/admin/donations"
            class="text-xs px-2 py-1 rounded text-slate-300 hover:bg-slate-800"
            active-class="text-white bg-slate-800"
          >Donaciones</RouterLink>
          <button type="button" class="text-xs text-slate-400 hover:text-white" @click="handleLogout">Salir</button>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
