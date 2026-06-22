import { defineStore } from 'pinia';

export type SidePanelTab = 'now' | 'history' | 'donate' | 'contact' | 'schedule';

export const useSidePanelStore = defineStore('sidePanel', {
  state: () => ({
    active: 'now' as SidePanelTab,
    open: false,
  }),

  actions: {
    openTab(tab: SidePanelTab): void {
      this.active = tab;
      this.open = true;
    },
    toggle(): void {
      this.open = !this.open;
    },
    close(): void {
      this.open = false;
    },
  },
});
