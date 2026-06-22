<script setup lang="ts">
import { computed } from 'vue';
import { useWelcomeStore } from '@/stores/welcome';
import { usePlayerStore } from '@/stores/player';
import { usePWAInstall } from '@/composables/usePWAInstall';
import logoUrl from '@/assets/airemedia.png';

const props = defineProps<{ onEnter: () => void }>();
const welcome = useWelcomeStore();
const player = usePlayerStore();
const { canInstall, install } = usePWAInstall();
const visible = computed(() => !welcome.alreadyEntered);

function handleEnter(): void { welcome.markEntered(); props.onEnter(); }
async function handleInstall(): Promise<void> { await install(); }
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[100] grid place-items-center" style="background: radial-gradient(ellipse at center, rgba(26,10,46,0.95) 0%, rgba(5,5,20,0.98) 100%);">
      <div class="text-center px-6 max-w-sm">
        <img :src="logoUrl" alt="AireMedia" class="h-20 sm:h-24 w-auto mx-auto mb-8" />
        <button type="button" :class="['mt-8 btn-primary text-lg px-10 py-4', !player.canPlay && !player.error ? 'opacity-60 cursor-wait' : '']" :disabled="!player.canPlay && !player.error" @click="handleEnter">
          <span v-if="!player.canPlay && !player.error" class="inline-flex items-center gap-2"><span class="inline-block h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />Conectando…</span>
          <span v-else class="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M8 5v14l11-7z" /></svg>{{ player.error ? 'Entrar sin audio' : 'Entrar a la radio' }}</span>
        </button>
        <button v-if="canInstall" type="button" class="mt-3 btn-ghost text-sm px-6 py-2" @click="handleInstall">Instalar app</button>
        <p v-if="player.error" class="mt-4 text-sm text-red-400">{{ player.error }}</p>
      </div>
    </div>
  </Transition>
</template>

<style>.fade-enter-active,.fade-leave-active{transition:opacity .5s ease}.fade-enter-from,.fade-leave-to{opacity:0}</style>
