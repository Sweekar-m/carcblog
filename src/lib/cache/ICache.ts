/**
 * Abstract Cache Interface
 * Allows seamless swapping of memory cache with Redis or Cloudflare KV in the future.
 */

export interface ICache<T = any> {
  get(key: string): T | null;
  set(key: string, value: T, ttlMs?: number): void;
  delete(key: string): void;
  clear(): void;
}
