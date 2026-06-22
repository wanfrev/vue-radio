import type { Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function useAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth === true);
    if (!requiresAuth) return true;

    const auth = useAuthStore();

    // If we haven't checked yet, wait for the initial fetchMe
    if (auth.loading) {
      // Simple poll: wait for fetchMe to finish
      await new Promise<void>((res) => {
        const interval = setInterval(() => {
          if (!auth.loading) {
            clearInterval(interval);
            res();
          }
        }, 100);
      });
    }

    if (!auth.isAuthenticated) {
      return { name: 'admin-login', query: { redirect: to.fullPath } };
    }

    return true;
  });
}
