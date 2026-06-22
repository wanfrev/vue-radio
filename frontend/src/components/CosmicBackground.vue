<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { resolveBloomColor } from '@/composables/useColorFromImage';

const props = withDefaults(
  defineProps<{ imageUrl?: string | null; seed?: string }>(),
  { imageUrl: null, seed: '' }
);

const color = ref('hsl(195, 85%, 55%)');

async function update(): Promise<void> {
  color.value = await resolveBloomColor(props.imageUrl, props.seed);
}

watch(() => [props.imageUrl, props.seed], () => void update(), { immediate: true });

const blobs = ref([
  { x: 20, y: 30, size: 50, speed: 0.02, hue: 0 },
  { x: 70, y: 60, size: 40, speed: 0.015, hue: 120 },
  { x: 50, y: 20, size: 60, speed: 0.025, hue: 240 },
  { x: 80, y: 80, size: 45, speed: 0.018, hue: 60 },
  { x: 30, y: 70, size: 55, speed: 0.022, hue: 180 },
]);
let animFrame = 0;
let running = false;

function animate(): void {
  animFrame += 0.012;
  for (let i = 0; i < blobs.value.length; i++) {
    const b = blobs.value[i]!;
    b.x = 50 + Math.sin(animFrame * b.speed * 100 + b.hue) * 40;
    b.y = 50 + Math.cos(animFrame * b.speed * 80 + b.hue) * 35;
  }
  if (running) requestAnimationFrame(animate);
}

onMounted(() => { running = true; requestAnimationFrame(animate); });
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
    <!-- Deep cosmic base -->
    <div class="absolute inset-0" style="background: radial-gradient(ellipse at top, #1a0a2e 0%, #050514 50%, #050510 100%);" />

    <!-- Cover art bloom (massive blur of the actual cover — always works) -->
    <div
      v-if="imageUrl"
      class="absolute inset-0 transition-all duration-[2500ms]"
      :style="{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(120px) saturate(2.5) brightness(0.35)',
        opacity: 0.7,
      }"
    />
    <!-- Fallback bloom (no cover) -->
    <div
      v-else
      class="absolute inset-0 transition-all duration-[2500ms]"
      :style="{
        background: `
          radial-gradient(ellipse 60% 50% at 50% 110%, ${color}, transparent 60%),
          radial-gradient(ellipse 50% 40% at 20% 30%, ${color}, transparent 60%),
          radial-gradient(ellipse 40% 30% at 80% 20%, ${color}, transparent 60%)`,
        opacity: 0.5,
      }"
    />

    <!-- Animated blobs (use extracted/hash color — always more vibrant in center) -->
    <div
      v-for="(blob, i) in blobs"
      :key="i"
      class="absolute rounded-full"
      :style="{
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: `${blob.size}vmax`,
        height: `${blob.size}vmax`,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: 'blur(60px)',
        opacity: 0.45,
      }"
    />

    <!-- Ultra-subtle cyber grid -->
    <div
      class="absolute inset-0 opacity-[0.02]"
      style="background-image:
        linear-gradient(rgba(34,211,238,1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px);
        background-size: 100px 100px;"
    />
  </div>
</template>
