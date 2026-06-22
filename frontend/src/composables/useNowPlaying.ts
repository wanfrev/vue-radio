import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useNowPlayingStore } from '@/stores/nowPlaying';
import { api, type NowPlaying } from '@/services/api';

/**
 * Subscribes to the SSE stream exposed by the backend. Falls back to polling
 * `/api/now-playing` if EventSource is unavailable (rare) or the connection
 * stays in an error state for more than `pollingFallbackMs`.
 *
 * Also fetches `/api/history` once on mount.
 */
export function useNowPlaying(): void {
  const store = useNowPlayingStore();
  const closeRef = ref<(() => void) | null>(null);
  const pollTimer = ref<number | null>(null);
  let errorCount = 0;

  function startPolling(): void {
    if (pollTimer.value !== null) return;
    store.setConnection('connecting');
    pollTimer.value = window.setInterval(async () => {
      try {
        const np = await api.nowPlaying();
        store.setCurrent(np);
        store.setConnection('open');
      } catch (e) {
        store.setConnection('error');
        console.warn('[polling] now-playing failed', e);
      }
    }, 7000);
  }

  function stopPolling(): void {
    if (pollTimer.value !== null) {
      window.clearInterval(pollTimer.value);
      pollTimer.value = null;
    }
  }

  function handleSnapshot(np: NowPlaying | null): void {
    store.setCurrent(np);
    store.setConnection('open');
    errorCount = 0;
  }

  function handleChange(np: NowPlaying): void {
    const prev = store.current;
    store.setCurrent(np);
    if (prev && prev.startedAt !== np.startedAt) {
      store.prependHistory({ ...prev, endedAt: Date.now() });
    }
    errorCount = 0;
  }

  function handleError(): void {
    errorCount += 1;
    if (errorCount >= 3) {
      store.setConnection('error');
      closeRef.value?.();
      closeRef.value = null;
      startPolling();
    } else {
      store.setConnection('connecting');
    }
  }

  function handleLiveChange(data: { isLive: boolean; liveStreamerName: string | null }): void {
    store.setLive(data);
  }

  async function fetchHistory(): Promise<void> {
    try {
      const { items } = await api.history();
      store.setHistory(items);
    } catch (e) {
      console.warn('[history] fetch failed', e);
    }
  }

  onMounted(() => {
    fetchHistory();
    if (typeof EventSource !== 'undefined') {
      store.setConnection('connecting');
      closeRef.value = api.openStream(handleSnapshot, handleChange, handleError, handleLiveChange);
    } else {
      startPolling();
    }
  });

  onBeforeUnmount(() => {
    closeRef.value?.();
    closeRef.value = null;
    stopPolling();
  });
}
