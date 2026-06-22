import { ref } from 'vue';

/**
 * Clipboard with fallback for legacy browsers. Exposes a `copied` ref that
 * resets automatically after 2 seconds.
 */
export function useClipboard() {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copied.value = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied.value = false;
        timer = null;
      }, 2000);
    } catch {
      // clipboard denied — silently ignore
    }
  }

  return { copied, copy };
}
