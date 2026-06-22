<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useDonationsStore } from '@/stores/donations';
import { useClipboard } from '@/composables/useClipboard';

const donations = useDonationsStore();
const { copied: copyState, copy } = useClipboard();
let lastCopiedId = -1;

function copyClabe(id: number, clabe: string): void {
  lastCopiedId = id;
  copy(clabe);
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') donations.closeModal();
}

watch(() => donations.showModal, (open) => {
  if (open) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
});

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const typeLabel: Record<string, string> = {
  ahorro: 'Ahorro',
  cheques: 'Cheques',
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="donations.showModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="donations.closeModal()"
      >
        <div
          class="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-slate-900 ring-1 ring-slate-800 shadow-2xl px-5 py-6 sm:p-6"
          style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0))"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Apoya la radio</h2>
            <button
              type="button"
              class="text-slate-400 hover:text-white transition p-1"
              aria-label="Cerrar"
              @click="donations.closeModal()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <p class="text-sm text-slate-400 mb-4">
            Si disfrutas la radio, considera apoyarnos con una donación.
          </p>

          <ul v-if="donations.accounts.length > 0" class="space-y-3">
            <li
              v-for="acc in donations.accounts"
              :key="acc.id"
              class="rounded-xl bg-slate-800/60 ring-1 ring-slate-700 p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-sm">{{ acc.bankName }}</span>
                <span class="text-xs text-slate-500">{{ typeLabel[acc.accountType] ?? acc.accountType }}</span>
              </div>
              <div class="text-sm text-slate-300 space-y-1">
                <div>
                  <span class="text-slate-500 text-xs uppercase tracking-wider">Titular</span>
                  <p>{{ acc.accountHolder }}</p>
                </div>
                <div>
                  <span class="text-slate-500 text-xs uppercase tracking-wider">CLABE</span>
                  <div class="flex items-center gap-2">
                    <code class="font-mono tabular-nums text-slate-100">{{ acc.clabe }}</code>
                    <button
                      type="button"
                      class="text-xs px-2 py-1 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition"
                      :aria-label="'Copiar CLABE de ' + acc.bankName"
                      @click="copyClabe(acc.id, acc.clabe)"
                    >
                      {{ copyState && lastCopiedId === acc.id ? '¡Copiado!' : 'Copiar' }}
                    </button>
                  </div>
                </div>
                <div v-if="acc.accountNumber">
                  <span class="text-slate-500 text-xs uppercase tracking-wider">Núm. de cuenta</span>
                  <p class="font-mono tabular-nums">{{ acc.accountNumber }}</p>
                </div>
              </div>
              <p v-if="acc.notes" class="mt-2 text-xs text-slate-500">{{ acc.notes }}</p>
            </li>
          </ul>

          <p v-else class="text-sm text-slate-500 text-center py-4">
            No hay cuentas disponibles por ahora. ¡Gracias de todas formas!
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-enter-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active > * {
  transition: transform 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-leave-active > * {
  transition: transform 0.2s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from > * {
  transform: translateY(1rem);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to > * {
  transform: translateY(1rem);
}
</style>
