/**
 * Tiny in-process TTL cache. Replaceable with Redis later (the interface
 * intentionally mirrors what a Redis-backed cache would expose).
 */
export class TtlCache<V> {
  private readonly store = new Map<string, { value: V; expiresAt: number }>();
  private readonly maxEntries: number;

  constructor(private readonly defaultTtlMs: number, maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): void {
    if (this.store.size >= this.maxEntries) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
