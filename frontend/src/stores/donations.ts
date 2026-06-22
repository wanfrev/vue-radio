import { defineStore } from 'pinia';
import type { DonationAccount } from '@/services/api';

interface State {
  accounts: DonationAccount[];
  loaded: boolean;
  showModal: boolean;
}

export const useDonationsStore = defineStore('donations', {
  state: (): State => ({
    accounts: [],
    loaded: false,
    showModal: false,
  }),

  getters: {
    hasDonations: (s) => s.accounts.length > 0,
  },

  actions: {
    async fetch(): Promise<void> {
      try {
        const res = await fetch('/api/donations', { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const data = (await res.json()) as { accounts: DonationAccount[] };
        this.accounts = data.accounts ?? [];
        this.loaded = true;
      } catch {
        // Silently ignore — donations are optional
      }
    },

    openModal(): void { this.showModal = true; },
    closeModal(): void { this.showModal = false; },
    toggleModal(): void { this.showModal = !this.showModal; },
  },
});
