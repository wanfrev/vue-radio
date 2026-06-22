<script setup lang="ts">
import { ref, watch } from 'vue';
import { resolveBloomColor } from '@/composables/useColorFromImage';

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null;
    seed?: string;
    isPlaying?: boolean;
    size?: number;
  }>(),
  { imageUrl: null, seed: 'radio', isPlaying: false, size: 280 }
);

const color = ref('rgba(34, 211, 238, 1)');

async function update(): Promise<void> {
  const c = await resolveBloomColor(props.imageUrl, props.seed);
  // Convert to rgba string
  const m = c.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (m) {
    const [, r, g, b] = m;
    color.value = `rgba(${r}, ${g}, ${b}, 1)`;
  } else {
    color.value = c;
  }
}

watch(() => [props.imageUrl, props.seed], () => void update(), { immediate: true });
</script>

<template>
  <div
    class="relative inline-block"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- Outer rotating ring -->
    <div
      class="absolute inset-0 rounded-full"
      :style="{
        background: `conic-gradient(from 0deg, transparent, ${color}, transparent 40%, transparent 100%)`,
        filter: 'blur(8px)',
        animation: isPlaying ? 'spin 6s linear infinite' : 'spin 12s linear infinite',
        opacity: 0.7,
      }"
    />
    <!-- Counter-rotating inner ring -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: `${size * 0.12}px`,
        background: `conic-gradient(from 180deg, transparent, ${color}, transparent 50%, transparent 100%)`,
        filter: 'blur(6px)',
        animation: isPlaying ? 'spin 8s linear infinite reverse' : 'spin 14s linear infinite reverse',
        opacity: 0.85,
      }"
    />
    <!-- Inner pulse -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: `${size * 0.25}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(12px)',
        animation: 'pulse 3s ease-in-out infinite',
      }"
    />
    <!-- Dashed orbit -->
    <div
      class="absolute rounded-full border-2"
      :style="{
        inset: `${size * 0.18}px`,
        borderColor: color,
        borderStyle: 'dashed',
        opacity: 0.4,
        animation: isPlaying ? 'spin 20s linear infinite' : 'spin 40s linear infinite',
        boxShadow: `0 0 24px ${color}`,
      }"
    />
    <!-- Core -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: `${size * 0.4}px`,
        background: `radial-gradient(circle, white 0%, ${color} 40%, transparent 80%)`,
        filter: 'blur(2px)',
      }"
    />
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.1); opacity: 1; }
}
</style>
