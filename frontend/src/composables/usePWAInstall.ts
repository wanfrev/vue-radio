import { onMounted, ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const canInstall = ref(false);
  const deferred = ref<BeforeInstallPromptEvent | null>(null);

  function onPrompt(e: Event): void {
    e.preventDefault();
    deferred.value = e as BeforeInstallPromptEvent;
    canInstall.value = true;
  }

  async function install(): Promise<boolean> {
    if (!deferred.value) return false;
    await deferred.value.prompt();
    const result = await deferred.value.userChoice;
    if (result.outcome === 'accepted') {
      canInstall.value = false;
      deferred.value = null;
      return true;
    }
    return false;
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', onPrompt);
  });

  return { canInstall, install };
}
