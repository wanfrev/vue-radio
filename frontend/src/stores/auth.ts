import { defineStore } from 'pinia';

interface User {
  username: string;
  role: string;
}

interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (s) => s.user !== null,
  },

  actions: {
    async fetchMe(): Promise<void> {
      this.loading = true;
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          this.user = (await res.json()) as User;
        }
      } catch {
        // Not logged in — silently ignore
      } finally {
        this.loading = false;
      }
    },

    async login(username: string, password: string): Promise<boolean> {
      this.error = null;
      this.loading = true;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          this.error = data.error ?? 'Invalid credentials';
          return false;
        }
        this.user = (await res.json()) as User;
        return true;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Network error';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout(): Promise<void> {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      this.user = null;
    },
  },
});
