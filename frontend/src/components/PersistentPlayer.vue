<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import PlayButton from './PlayButton.vue';
import VolumeControl from './VolumeControl.vue';
import DonateButton from './DonateButton.vue';
import LiveStatusBadge from './admin/LiveStatusBadge.vue';

const player = usePlayerStore();
const np = useNowPlayingStore();

const props = defineProps<{ onPlay: () => void; onPause: () => void }>();

const statusLabel = computed(() => {
  if (player.error) return player.error;
  if (player.isBuffering) return 'Conectando…';
  if (player.isPlaying) return 'En vivo';
  if (np.current) return 'En pausa';
  return '—';
});

const statusColor = computed(() => {
  if (player.error) return '#f87171';
  if (player.isBuffering) return '#fbbf24';
  if (player.isPlaying) return '#22d3ee';
  return '#64748b';
});
</script>

<template>
  <footer class="fixed bottom-0 inset-x-0 z-40" style="padding-bottom: env(safe-area-inset-bottom, 0)">
    <div class="absolute inset-0"
      style="background: linear-gradient(0deg, rgba(5,5,20,0.9) 0%, rgba(5,5,20,0.4) 70%, transparent 100%);
        backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
        border-top: 1px solid rgba(34,211,238,0.12); box-shadow: 0 -8px 32px rgba(0,0,0,0.4);" />
    <div class="relative max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-3 sm:gap-4">
      <div class="h-10 w-1 rounded-full shrink-0 hidden sm:block" :style="{ background: statusColor, boxShadow: `0 0 12px ${statusColor}` }" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-0.5">
          <LiveStatusBadge v-if="np.current?.isLive" :is-live="true" :streamer-name="np.current.liveStreamerName ?? null" :pulse="true" />
          <span v-else class="label-cyber">{{ statusLabel }}</span>
          <span v-if="np.current?.listeners !== undefined" class="text-[10px] text-slate-500 tabular-nums uppercase tracking-wider">· {{ np.current.listeners }} oyentes</span>
        </div>
        <div class="truncate font-semibold text-slate-100" :title="np.current?.title">{{ np.current?.title ?? '—' }}</div>
        <div class="truncate text-xs text-slate-400" :title="np.current?.artist">{{ np.current?.artist ?? player.stationName }}</div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <DonateButton />
        <PlayButton :on-play="props.onPlay" :on-pause="props.onPause" size="sm" />
        <VolumeControl class="hidden sm:flex" />
      </div>
    </div>
  </footer>
</template>
