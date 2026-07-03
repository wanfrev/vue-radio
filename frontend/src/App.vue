<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AudioCore from '@/components/AudioCore.vue';
import WelcomeOverlay from '@/components/WelcomeOverlay.vue';
import Navbar from '@/components/Navbar.vue';
import DonateModal from '@/components/DonateModal.vue';
import ContactModal from '@/components/ContactModal.vue';
import ScheduleModal from '@/components/ScheduleModal.vue';
import CosmicBackground from '@/components/CosmicBackground.vue';
import { useNowPlaying } from '@/composables/useNowPlaying';
import { useDonationsStore } from '@/stores/donations';
import { usePlayerStore } from '@/stores/player';

const route = useRoute();
const player = usePlayerStore();
useNowPlaying();

const isAdmin = computed(() => route.path.startsWith('/admin'));

const donations = useDonationsStore();

onMounted(() => {
  void donations.fetch();
});

function onPlay(): void { player.requestPlay(); }
function onPause(): void { player.requestPause(); }
</script>

<template>
  <CosmicBackground v-if="!isAdmin" />

  <div class="min-h-screen flex flex-col text-slate-100 relative">
    <WelcomeOverlay v-if="!isAdmin" :on-enter="onPlay" />
    <Navbar v-if="!isAdmin" />

    <main v-if="!isAdmin" class="flex-1 w-full relative z-10">
      <RouterView v-slot="{ Component, route: r }">
        <component :is="Component" :key="r.fullPath" />
      </RouterView>
    </main>

    <RouterView v-else />

    <AudioCore v-if="!isAdmin" ref="audioCore" />
    <DonateModal v-if="!isAdmin" />
    <ContactModal v-if="!isAdmin" />
    <ScheduleModal v-if="!isAdmin" />
  </div>
</template>