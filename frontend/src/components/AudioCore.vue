<script setup lang="ts">
/**
 * Owns the single <audio> instance for the entire app. The `src` is set once
 * on mount and never reactively re-bound, so the stream does not get torn
 * down when metadata updates.
 *
 * Mount this component exactly once, at the root of the app.
 */
import { onMounted, ref } from 'vue';
import { api } from '@/services/api';
import { usePlayerStore } from '@/stores/player';
import { useMediaSession } from '@/composables/useMediaSession';

const audio = ref<HTMLAudioElement | null>(null);
const player = usePlayerStore();

const controls = useMediaSession(audio);

// Expose controls so sibling components (the visible player bar) can drive it.
defineExpose({ ...controls, audio });

onMounted(async () => {
  try {
    const info = await api.streamUrl();
    player.setStream(info.url, info.name);
    if (audio.value) {
      audio.value.src = info.url;
      audio.value.preload = 'none';
      audio.value.crossOrigin = 'anonymous';
      // volume is applied by useMediaSession onMounted
    }
  } catch (e) {
    player.setError('Could not load stream URL');
    console.warn('[AudioCore] stream-url failed', e);
  }
});
</script>

<template>
  <audio
    ref="audio"
    class="hidden"
    playsinline
    preload="none"
  />
</template>
