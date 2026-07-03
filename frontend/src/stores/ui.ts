import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ModalName = 'donate' | 'contact' | 'schedule' | null;

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ModalName>(null);

  function open(name: ModalName) {
    activeModal.value = name;
  }

  function close() {
    activeModal.value = null;
  }

  function toggle(name: ModalName) {
    activeModal.value = activeModal.value === name ? null : name;
  }

  return { activeModal, open, close, toggle };
});