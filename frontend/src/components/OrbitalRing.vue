<script setup lang="ts">
import { ref, watch } from 'vue';
import { resolveBloomColor } from '@/composables/useColorFromImage';

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null;
    seed?: string;
    isPlaying?: boolean;
  }>(),
  { imageUrl: null, seed: '', isPlaying: false }
);

const color = ref('hsl(195, 85%, 55%)');

async function update(): Promise<void> {
  color.value = await resolveBloomColor(props.imageUrl, props.seed);
}

watch(() => [props.imageUrl, props.seed], () => void update(), { immediate: true });

const particles = [
  { distance: 16, size: 3, speed: 8, delay: 0 },
  { distance: 22, size: 2, speed: 12, delay: 1.5 },
  { distance: 28, size: 4, speed: 16, delay: 3 },
  { distance: 10, size: 2, speed: 6, delay: 0.8 },
  { distance: 20, size: 3, speed: 10, delay: 2.2 },
  { distance: 34, size: 2, speed: 14, delay: 4 },
];
</script>

<template>
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <!-- Cover art bloom inside the ring -->
    <div
      v-if="imageUrl"
      class="absolute rounded-full"
      :style="{
        inset: '-8px',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(40px) saturate(3) brightness(0.6)',
        opacity: 0.5,
      }"
    />
    <!-- Fallback bloom -->
    <div
      v-else
      class="absolute rounded-full"
      :style="{
        inset: '-8px',
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: 'blur(30px)',
        opacity: 0.4,
      }"
    />

    <!-- === 1. Glow halo === -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: '-12px',
        border: `2px solid ${color}`,
        boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}`,
        opacity: 0.2,
        animation: 'pulse-ring 4s ease-in-out infinite',
      }"
    />

    <!-- === 2. Spinning arc === -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: '-6px',
        border: '3px solid transparent',
        borderTopColor: color,
        borderRightColor: color,
        opacity: 0.6,
        animation: isPlaying ? 'spin 4s linear infinite' : 'spin 8s linear infinite',
        filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`,
      }"
    />

    <!-- === 3. Reverse arc === -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: '-2px',
        border: '2px solid transparent',
        borderBottomColor: color,
        borderLeftColor: color,
        opacity: 0.45,
        animation: isPlaying ? 'spin 6s linear infinite reverse' : 'spin 12s linear infinite reverse',
        filter: `drop-shadow(0 0 4px ${color})`,
      }"
    />

    <!-- === 4. Fixed ring === -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: '2px',
        border: `1.5px solid ${color}`,
        opacity: 0.25,
        boxShadow: `0 0 20px ${color}`,
        animation: 'pulse-ring 3s ease-in-out infinite',
      }"
    />

    <!-- === 5. Outer scan === -->
    <div
      class="absolute rounded-full"
      :style="{
        inset: '-20px',
        border: `1px solid transparent`,
        borderTopColor: color,
        opacity: 0.12,
        animation: isPlaying ? 'spin 20s linear infinite' : 'spin 40s linear infinite',
        filter: `drop-shadow(0 0 4px ${color})`,
      }"
    />

    <!-- === 6. Orbiting particles === -->
    <div
      v-for="(p, i) in particles"
      :key="i"
      class="absolute rounded-full"
      :style="{
        inset: `-${p.distance}px`,
        animation: `spin ${p.speed}s linear infinite`,
        animationDelay: `${p.delay}s`,
      }"
    >
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        :style="{
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
          boxShadow: `0 0 ${p.size * 3}px ${color}`,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-ring { 0%,100% { opacity: 0.2; } 50% { opacity: 0.5; } }
</style>
