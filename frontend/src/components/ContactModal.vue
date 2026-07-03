<script setup lang="ts">
import { ref } from 'vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const name = ref('');
const email = ref('');
const message = ref('');
const sent = ref(false);

function submit() {
  sent.value = true;
  setTimeout(() => {
    sent.value = false;
    name.value = '';
    email.value = '';
    message.value = '';
    ui.close();
  }, 2000);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.activeModal === 'contact'" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="ui.close()">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div class="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Contacto</h2>
          <button type="button" class="text-slate-400 hover:text-white p-1" @click="ui.close()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          </button>
        </div>

        <p class="text-sm text-slate-400 mb-4">Peticiones, saludos o reporte de problemas.</p>

        <form v-if="!sent" class="space-y-3" @submit.prevent="submit">
          <input v-model="name" type="text" placeholder="Nombre" required class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input v-model="email" type="email" placeholder="Email" required class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <textarea v-model="message" rows="3" placeholder="Mensaje" required class="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
          <button type="submit" class="btn-primary w-full text-sm">Enviar</button>
        </form>

        <div v-else class="text-center py-4">
          <p class="text-emerald-400 text-sm font-medium">¡Mensaje enviado!</p>
          <p class="text-slate-500 text-xs mt-1">Nos pondremos en contacto pronto.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>