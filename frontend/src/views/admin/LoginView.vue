<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
  <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <span class="inline-block h-12 w-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white font-bold text-lg">R</span>
        <h1 class="mt-3 text-xl font-bold">Panel de administración</h1>
      </div>

      <form @submit.prevent="submit" class="card space-y-4">
        <div>
          <label class="block text-sm text-slate-300 mb-1" for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
            class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-300 mb-1" for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div v-if="error" class="text-sm text-red-400">{{ error }}</div>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="submitting"
        >
          <span v-if="submitting" class="inline-flex items-center gap-2">
            <span class="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Entrando…
          </span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>
