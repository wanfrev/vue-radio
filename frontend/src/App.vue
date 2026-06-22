<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import AudioCore from '@/components/AudioCore.vue';
import WelcomeOverlay from '@/components/WelcomeOverlay.vue';
import DonateModal from '@/components/DonateModal.vue';
import CosmicBackground from '@/components/CosmicBackground.vue';
import { useNowPlaying } from '@/composables/useNowPlaying';
import { useDonationsStore } from '@/stores/donations';
import { useNowPlayingStore } from '@/stores/nowPlaying';

const audioCore = ref<InstanceType<typeof AudioCore> | null>(null);
useNowPlaying();
const np = useNowPlayingStore();

const donations = useDonationsStore();

onMounted(() => {
  void donations.fetch();
});

function onPlay(): void { audioCore.value?.tryPlay(); }
function onPause(): void { audioCore.value?.pause(); }
</script>

<template>
  <CosmicBackground
    :image-url="np.current?.art ?? null"
    :seed="(np.current?.title ?? '') + '|' + (np.current?.artist ?? '')"
  />

  <div class="min-h-screen flex flex-col text-slate-100 relative">
    <WelcomeOverlay :on-enter="onPlay" />

    <main class="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 relative z-10">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>

    <AudioCore ref="audioCore" />
    <DonateModal />
  </div>
</template>
