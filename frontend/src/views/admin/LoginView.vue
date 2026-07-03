<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);

async function submit(): Promise<void> {
  error.value = null;
  submitting.value = true;
  try {
    const ok = await auth.login(username.value, password.value);
    if (ok) {
      const redirect = (route.query.redirect as string) ?? '/admin/dashboard';
      await router.push(redirect);
    } else {
      error.value = auth.error ?? 'Credenciales inválidas';
    }
  } catch {
    error.value = 'Error de conexión';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <span class="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white font-bold text-xl shadow-lg shadow-violet-500/20">R</span>
        <h1 class="mt-4 text-2xl font-bold tracking-tight">Administración</h1>
        <p class="mt-1 text-sm text-slate-500">Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="submit" class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider" for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
            placeholder="admin"
            class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider" for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
        </div>

        <div v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium text-sm py-2.5 hover:from-cyan-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
        >
          <span v-if="submitting" class="inline-flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Verificando…
          </span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <RouterLink to="/" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          &larr; Volver a la radio
        </RouterLink>
      </div>
    </div>
  </div>
</template>