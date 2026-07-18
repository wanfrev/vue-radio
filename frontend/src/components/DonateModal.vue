<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUiStore } from '@/stores/ui';
import { useDonationsStore } from '@/stores/donations';

const ui = useUiStore();
const donations = useDonationsStore();

const copied = ref<number | null>(null);

function copy(val: string, id: number) {
  navigator.clipboard.writeText(val).then(() => {
    copied.value = id;
    setTimeout(() => { copied.value = null; }, 2000);
  });
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') ui.close();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  if (!donations.loaded) donations.fetch();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});

function headerColor(name: string): string {
  const n = name.toLowerCase();
  if (n === 'zelle' || n.includes('zelle')) return 'text-emerald-400';
  if (n === 'pago móvil' || n.includes('pago móvil') || n.includes('pago movil')) return 'text-amber-400';
  return 'text-slate-100';
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popover">
      <div
        v-if="ui.activeModal === 'donate'"
        class="fixed inset-0 z-50"
        @click="ui.close()"
      >
        <div
          class="absolute top-14 right-4 w-80 max-h-[70vh] overflow-y-auto rounded-xl bg-slate-900 ring-1 ring-slate-700 shadow-2xl px-4 py-4 popover-scroll"
          @click.stop
        >
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold">Invítame un café</h2>
            <button
              type="button"
              class="text-slate-400 hover:text-white transition p-0.5"
              aria-label="Cerrar"
              @click="ui.close()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <p class="text-xs text-slate-400 mb-3">
            Si te gusta lo que escuchas, invítame un café para mantener la energía.
          </p>

          <div v-if="donations.accounts.length > 0" class="space-y-2">
            <div
              v-for="acc in donations.accounts"
              :key="acc.id"
              class="rounded-lg bg-slate-800/60 ring-1 ring-slate-700 p-3"
            >
              <span class="font-semibold text-xs block mb-1.5" :class="headerColor(acc.bankName)">{{ acc.bankName }}</span>
              <div class="text-xs text-slate-300 space-y-1.5">
                <div v-for="(field, fi) in acc.fields" :key="fi" class="flex items-center gap-2">
                  <span class="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 w-14">{{ field.label }}</span>
                  <p class="font-mono tabular-nums" :class="field.copyable ? 'text-slate-100' : ''">{{ field.value }}</p>
                  <button
                    v-if="field.copyable"
                    type="button"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition ml-auto shrink-0"
                    @click="copy(field.value, acc.id * 100 + fi)"
                  >
                    {{ copied === acc.id * 100 + fi ? 'OK' : 'Copiar' }}
                  </button>
                </div>
              </div>
              <p v-if="acc.notes" class="mt-2 text-[10px] text-slate-500">{{ acc.notes }}</p>
            </div>
          </div>

          <div v-else class="text-xs text-slate-500 text-center py-6">
            No hay cuentas disponibles por ahora.
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.popover-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.popover-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.popover-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}
.popover-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.popover-scroll::-webkit-scrollbar {
  width: 4px;
}
.popover-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.popover-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 2px;
}
.popover-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
}
</style>
