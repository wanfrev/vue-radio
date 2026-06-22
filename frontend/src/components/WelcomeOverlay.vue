<script setup lang="ts">
import { computed } from 'vue';
import { useWelcomeStore } from '@/stores/welcome';
import { usePlayerStore } from '@/stores/player';
import { usePWAInstall } from '@/composables/usePWAInstall';

const props = defineProps<{
  onEnter: () => void;
}>();

const welcome = useWelcomeStore();
const player = usePlayerStore();
const { canInstall, install } = usePWAInstall();

const visible = computed(() => !welcome.alreadyEntered);

function handleEnter(): void {
  welcome.markEntered();
  props.onEnter();
}

async function handleInstall(): Promise<void> {
  await install();
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] grid place-items-center bg-slate-950"
    >
      <div class="text-center px-6 max-w-sm">
        <div class="h-24 w-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white text-4xl font-bold shadow-xl shadow-brand-900/30">
          R
        </div>

        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          {{ player.stationName }}
        </h1>
        <p class="mt-2 text-slate-400">
          Música 24/7, sin pausas
        </p>

        <button
          type="button"
          :disabled="!player.canPlay"
          :class="[
            'mt-8 btn-primary text-lg px-10 py-4',
            !player.canPlay ? 'opacity-60 cursor-wait' : '',
          ]"
          @click="handleEnter"
        >
          <span v-if="!player.canPlay" class="inline-flex items-center gap-2">
            <span class="inline-block h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Conectando…
          </span>
          <span v-else class="inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
            Entrar a la radio
          </span>
        </button>

        <button
          v-if="canInstall"
          type="button"
          class="mt-3 btn-ghost text-sm px-6 py-2"
          @click="handleInstall"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 mr-1.5">
            <path d="M12 2.25a.75.75 0 01.75.75v11.19l2.97-2.97a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 111.06-1.06l2.97 2.97V3a.75.75 0 01.75-.75z" />
            <path d="M5.25 15.75a.75.75 0 01.75.75v2.25c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75V16.5a.75.75 0 011.5 0v2.25a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V16.5a.75.75 0 01.75-.75z" />
          </svg>
          Instalar app
        </button>

        <p v-if="player.error" class="mt-4 text-sm text-red-400">
          {{ player.error }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
