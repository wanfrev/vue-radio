import { defineStore } from 'pinia';

const STORAGE_KEY = 'radio_welcomed_v1';

export const useWelcomeStore = defineStore('welcome', {
  state: () => ({
    entered: localStorage.getItem(STORAGE_KEY) === '1',
  }),

  getters: {
    alreadyEntered: (s) => s.entered,
  },

  actions: {
    markEntered(): void {
      this.entered = true;
      localStorage.setItem(STORAGE_KEY, '1');
    },
  },
});
