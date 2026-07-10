<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();

const copied = ref<'phone' | 'email' | null>(null);

function copy(val: string, type: 'phone' | 'email') {
  navigator.clipboard.writeText(val).then(() => {
    copied.value = type;
    setTimeout(() => { copied.value = null; }, 2000);
  });
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') ui.close();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
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
            Si te gusta lo que escuchas, invítame un café para mantener la radio al aire.
          </p>

          <div class="space-y-2">
            <div class="rounded-lg bg-slate-800/60 ring-1 ring-slate-700 p-3">
              <span class="font-semibold text-xs text-amber-400">Pago Móvil</span>
              <div class="mt-1.5 text-xs text-slate-300 space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 w-14">Teléfono</span>
                  <p class="font-mono tabular-nums text-slate-100">04146590118</p>
                  <button
                    type="button"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition ml-auto"
                    @click="copy('04146590118', 'phone')"
                  >
                    {{ copied === 'phone' ? 'OK' : 'Copiar' }}
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 w-14">C.I.</span>
                  <p class="font-mono tabular-nums">10453881</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 w-14">Banco</span>
                  <p>Vzla</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg bg-slate-800/60 ring-1 ring-slate-700 p-3">
              <span class="font-semibold text-xs text-emerald-400">ZELLE</span>
              <div class="mt-1.5 text-xs text-slate-300 space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 text-[10px] uppercase tracking-wider shrink-0">Correo</span>
                  <p class="font-mono text-slate-100 break-all">vilchezelvis@gmail.com</p>
                  <button
                    type="button"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition shrink-0 ml-auto"
                    @click="copy('vilchezelvis@gmail.com', 'email')"
                  >
                    {{ copied === 'email' ? 'OK' : 'Copiar' }}
                  </button>
                </div>
              </div>
            </div>
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
