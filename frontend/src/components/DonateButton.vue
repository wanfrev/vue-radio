<script setup lang="ts">
import { useDonationsStore } from '@/stores/donations';

const donations = useDonationsStore();
</script>

<template>
  <button
    v-if="donations.hasDonations"
    type="button"
    class="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition px-2 py-1 rounded-full hover:bg-slate-800/60"
    :aria-label="'Donar — ' + donations.accounts.length + ' cuentas disponibles'"
    @click="donations.openModal()"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
    <span class="hidden sm:inline text-sm">Donar</span>
  </button>
</template>
