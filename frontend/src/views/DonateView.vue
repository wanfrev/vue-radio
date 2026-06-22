<script setup lang="ts">
import { onMounted } from 'vue';
import { useDonationsStore } from '@/stores/donations';
import { useClipboard } from '@/composables/useClipboard';
import { RouterLink } from 'vue-router';

const donations = useDonationsStore();
const { copied: copyState, copy } = useClipboard();
let lastCopiedId = -1;

function copyClabe(id: number, clabe: string): void {
  lastCopiedId = id;
  copy(clabe);
}

const typeLabel: Record<string, string> = {
  ahorro: 'Ahorro',
  cheques: 'Cheques',
};

onMounted(async () => {
  if (!donations.loaded) await donations.fetch();
});
</script>

<template>
  <section class="max-w-xl mx-auto">
    <header class="mb-5">
      <h1 class="text-2xl font-bold">Apoya la radio</h1>
      <p class="text-slate-400 text-sm">
        Si disfrutas la radio, considera apoyarnos con una donación. Aquí están nuestras cuentas.
      </p>
    </header>

    <ul v-if="donations.accounts.length > 0" class="space-y-3">
      <li
        v-for="acc in donations.accounts"
        :key="acc.id"
        class="card"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold">{{ acc.bankName }}</span>
          <span class="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">{{ typeLabel[acc.accountType] ?? acc.accountType }}</span>
        </div>
        <dl class="text-sm text-slate-300 space-y-2">
          <div>
            <dt class="text-slate-500 text-xs uppercase tracking-wider">Titular</dt>
            <dd>{{ acc.accountHolder }}</dd>
          </div>
          <div>
            <dt class="text-slate-500 text-xs uppercase tracking-wider">CLABE</dt>
            <dd class="flex items-center gap-2">
              <code class="font-mono tabular-nums text-slate-100 text-base">{{ acc.clabe }}</code>
              <button
                type="button"
                class="text-xs px-2 py-1 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition"
                :aria-label="'Copiar CLABE de ' + acc.bankName"
                @click="copyClabe(acc.id, acc.clabe)"
              >
                {{ copyState && lastCopiedId === acc.id ? '¡Copiado!' : 'Copiar' }}
              </button>
            </dd>
          </div>
          <div v-if="acc.accountNumber">
            <dt class="text-slate-500 text-xs uppercase tracking-wider">Número de cuenta</dt>
            <dd class="font-mono tabular-nums">{{ acc.accountNumber }}</dd>
          </div>
        </dl>
        <p v-if="acc.notes" class="mt-3 text-xs text-slate-500">{{ acc.notes }}</p>
      </li>
    </ul>

    <div v-else class="card text-center text-slate-400 text-sm py-10">
      <p>No hay cuentas disponibles por ahora.</p>
      <p class="mt-2">¡Gracias de todas formas!</p>
    </div>

    <p class="mt-6 text-center text-sm text-slate-500">
      <RouterLink to="/" class="text-brand-400 hover:text-brand-300 transition">Volver al inicio</RouterLink>
    </p>
  </section>
</template>
