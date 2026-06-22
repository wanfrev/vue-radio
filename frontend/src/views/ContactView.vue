<script setup lang="ts">
import { ref } from 'vue';

const form = ref({ name: '', email: '', message: '' });
const sent = ref(false);
const error = ref<string | null>(null);

async function submit(): Promise<void> {
  error.value = null;
  // Wire this to your real backend endpoint when ready.
  await new Promise((r) => setTimeout(r, 500));
  sent.value = true;
}
</script>

<template>
  <section class="max-w-xl">
    <header class="mb-5">
      <h1 class="text-2xl font-bold">Contacto</h1>
      <p class="text-slate-400 text-sm">Peticiones, saludos o reporte de problemas técnicos.</p>
    </header>

    <form v-if="!sent" class="card space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm text-slate-300 mb-1" for="name">Nombre</label>
        <input id="name" v-model="form.name" required class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      <div>
        <label class="block text-sm text-slate-300 mb-1" for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      <div>
        <label class="block text-sm text-slate-300 mb-1" for="message">Mensaje</label>
        <textarea id="message" v-model="form.message" rows="5" required class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"></textarea>
      </div>
      <div v-if="error" class="text-sm text-red-400">{{ error }}</div>
      <button type="submit" class="btn-primary">Enviar</button>
    </form>

    <div v-else class="card">
      <h2 class="font-semibold mb-1">¡Gracias!</h2>
      <p class="text-slate-300 text-sm">Recibimos tu mensaje. Te respondemos pronto.</p>
    </div>
  </section>
</template>
