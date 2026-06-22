<script setup lang="ts">
import { computed } from 'vue';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const props = withDefaults(
  defineProps<{
    src: string | null;
    alt?: string;
    size?: Size;
    rounded?: boolean;
  }>(),
  { size: 'md', rounded: true }
);

const sizeClass: Record<Size, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-44 w-44',
};

const fallback = computed(() => {
  const letter = (props.alt ?? '?').trim().charAt(0).toUpperCase() || '?';
  return letter;
});
</script>

<template>
  <div
    :class="[
      sizeClass[size],
      rounded ? 'rounded-lg' : '',
      'relative shrink-0 overflow-hidden bg-slate-800 ring-1 ring-slate-700',
      'flex items-center justify-center text-slate-400',
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt ?? 'cover'"
      class="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
    />
    <span v-else class="text-2xl font-semibold">{{ fallback }}</span>
  </div>
</template>
