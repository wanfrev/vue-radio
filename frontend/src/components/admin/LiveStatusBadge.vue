<script setup lang="ts">
defineProps<{
  isLive: boolean;
  streamerName: string | null;
  pulse?: boolean;
}>();
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5',
      isLive
        ? 'text-red-200 bg-red-500/20 ring-1 ring-red-500/40'
        : 'text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-500/30',
      pulse && isLive ? 'animate-pulse-soft' : '',
    ]"
  >
    <span
      :class="[
        'inline-block h-1.5 w-1.5 rounded-full',
        isLive ? 'bg-red-400' : 'bg-emerald-400',
      ]"
    />
    {{ isLive ? (streamerName ? `EN VIVO · ${streamerName}` : 'EN VIVO') : 'AUTODJ' }}
  </span>
</template>
