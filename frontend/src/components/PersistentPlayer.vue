<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import PlayButton from './PlayButton.vue';
import VolumeControl from './VolumeControl.vue';
import DonateButton from './DonateButton.vue';
import LiveStatusBadge from './admin/LiveStatusBadge.vue';
import CoverArt from './CoverArt.vue';

const player = usePlayerStore();
const np = useNowPlayingStore();

const props = defineProps<{
  onPlay:  () => void;
  onPause: () => void;
}>();

const statusLabel = computed(() => {
  if (player.error) return player.error;
  if (player.isBuffering) return 'Conectando…';
  if (player.isPlaying) return 'En vivo';
  if (np.current) return 'En pausa';
  return '—';
});

const statusColor = computed(() => {
  if (player.error) return 'bg-red-500';
  if (player.isBuffering) return 'bg-amber-400 animate-pulse-soft';
  if (player.isPlaying) return 'bg-emerald-400 animate-pulse-soft';
  return 'bg-slate-500';
});
</script>

<template>
  <footer
    class="fixed bottom-0 inset-x-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur"
    style="padding-bottom: env(safe-area-inset-bottom, 0)"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-20 sm:h-20 flex items-center gap-3 sm:gap-4">
      <CoverArt
        :src="np.current?.art ?? null"
        :alt="np.current?.title ?? player.stationName"
        size="md"
        class="hidden sm:flex"
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <LiveStatusBadge
            v-if="np.current?.isLive"
            :is-live="true"
            :streamer-name="np.current.liveStreamerName ?? null"
            :pulse="true"
          />
          <span v-else :class="['inline-block h-2 w-2 rounded-full', statusColor]" />
          <span>{{ statusLabel }}</span>
          <span v-if="np.current?.listeners !== undefined" class="hidden sm:inline text-slate-500">
            · {{ np.current.listeners }} oyentes
          </span>
        </div>
        <div class="truncate font-semibold text-slate-100" :title="np.current?.title">
          {{ np.current?.title ?? '—' }}
        </div>
        <div class="truncate text-sm text-slate-400" :title="np.current?.artist">
          {{ np.current?.artist ?? player.stationName }}
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <DonateButton />
        <PlayButton :on-play="props.onPlay" :on-pause="props.onPause" size="md" />
        <VolumeControl class="hidden sm:flex" />
      </div>
    </div>
  </footer>
</template>
