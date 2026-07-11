<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AudioCore from '@/components/AudioCore.vue';
import DonateModal from '@/components/DonateModal.vue';
import CosmicBackground from '@/components/CosmicBackground.vue';
import { useNowPlaying } from '@/composables/useNowPlaying';
import { useDonationsStore } from '@/stores/donations';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const ui = useUiStore();
useNowPlaying();

const isAdmin = computed(() => route.path.startsWith('/admin'));

const donations = useDonationsStore();

onMounted(() => {
  void donations.fetch();
});
</script>

<template>
  <CosmicBackground v-if="!isAdmin" />

  <div class="min-h-screen flex flex-col text-slate-100 relative">
    <div v-if="!isAdmin" class="fixed top-0 inset-x-0 z-30 flex items-center justify-end gap-3 px-4 py-3">
      <a
        href="https://whatsapp.com/channel/0029Vb8qgaeFnSzDE2tApn0J"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-green-700 hover:bg-green-600 text-white ring-1 ring-green-500/50 hover:ring-green-400/70 transition-all"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.087.567 4.036 1.544 5.694L.553 23.999l6.948-1.255A12.02 12.02 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.044a10.04 10.04 0 01-5.195-1.452l-.735-.44-4.164.754.834-4.006-.47-.782A10.042 10.042 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
      <button
        type="button"
        class="px-4 py-2 rounded-full text-sm font-semibold text-white hover:text-white bg-violet-700 hover:bg-violet-600 ring-1 ring-violet-500/50 hover:ring-violet-400/70 transition-all"
        @click="ui.toggle('donate')"
      >
        Invítame un café
      </button>
    </div>

    <main v-if="!isAdmin" class="flex-1 w-full relative z-10">
      <RouterView v-slot="{ Component, route: r }">
        <component :is="Component" :key="r.fullPath" />
      </RouterView>
    </main>

    <RouterView v-else />

    <AudioCore v-if="!isAdmin" />
    <DonateModal v-if="!isAdmin" />
  </div>
</template>