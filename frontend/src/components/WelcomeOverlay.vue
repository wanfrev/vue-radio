<script setup lang="ts">
import { computed } from 'vue';
import { useWelcomeStore } from '@/stores/welcome';
import { usePlayerStore } from '@/stores/player';
import logoUrl from '@/assets/airemedia.png';

const props = defineProps<{ onEnter: () => void }>();
const welcome = useWelcomeStore();
const player = usePlayerStore();
const visible = computed(() => !welcome.alreadyEntered);

function handleEnter(): void {
  welcome.markEntered();
  props.onEnter();
}
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[100] grid place-items-center bg-slate-950">
      <div class="text-center px-6 max-w-sm">
        <img :src="logoUrl" alt="AireMedia" class="h-28 w-auto mx-auto mb-8 drop-shadow-lg" />
        <button
          type="button"
          class="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
          @click="handleEnter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
            <path d="M8 5v14l11-7z" />
          </svg>
          Escuchar en vivo
        </button>
      </div>
    </div>
  </Transition>
</template>

<style>
.fade-enter-active,.fade-leave-active{transition:opacity .4s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
