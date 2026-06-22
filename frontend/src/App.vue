<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import AudioCore from '@/components/AudioCore.vue';
import PersistentPlayer from '@/components/PersistentPlayer.vue';
import WelcomeOverlay from '@/components/WelcomeOverlay.vue';
import DonateModal from '@/components/DonateModal.vue';
import { useNowPlaying } from '@/composables/useNowPlaying';
import { useDonationsStore } from '@/stores/donations';

const audioCore = ref<InstanceType<typeof AudioCore> | null>(null);

// Boot the SSE/polling subscription once, at the root.
useNowPlaying();

const donations = useDonationsStore();

onMounted(() => {
  void donations.fetch();
});

function onPlay(): void {
  audioCore.value?.tryPlay();
}
function onPause(): void {
  audioCore.value?.pause();
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
    <WelcomeOverlay :on-enter="onPlay" />

    <Navbar />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </main>

    <PersistentPlayer :on-play="onPlay" :on-pause="onPause" />

    <!--
      AudioCore is mounted once and lives outside the <RouterView> so the
      <audio> instance is never destroyed by route changes.
    -->
    <AudioCore ref="audioCore" />

    <DonateModal />
  </div>
</template>
