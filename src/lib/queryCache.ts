/**
 * Simple LRU (Least Recently Used) Cache for Database Queries
 *
 * Performance optimization to reduce database query latency for frequently
 * accessed data in the AI assistant tool calls.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private ttlMs: number;
  private stats: { hits: number; misses: number };

  constructor(maxSize: number = 100, ttlMs: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs; // Default 60 seconds
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Generate cache key from user ID and query parameters
   */
  private generateKey(userId: string, queryType: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${userId}:${queryType}:${paramStr}`;
  }

  /**
   * Check if cache entry is still valid based on TTL
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < this.ttlMs;
  }

  /**
   * Evict least recently used entry when cache is full
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTimestamp) {
        lruTimestamp = entry.timestamp;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Get cached data if available and valid
   */
  get<T>(userId: string, queryType: string, params?: any): T | null {
    const key = this.generateKey(userId, queryType, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access timestamp and hit count
    entry.timestamp = Date.now();
    entry.hits++;
    this.stats.hits++;

    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  set<T>(userId: string, queryType: string, data: T, params?: any): void {
    const key = this.generateKey(userId, queryType, params);

    // Evict if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Invalidate cache entries for a specific user
   */
  invalidate(userId: string, queryType?: string): void {
    if (queryType) {
      // Invalidate specific query type
      const prefix = `${userId}:${queryType}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Invalidate all entries for user
      const prefix = `${userId}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
    };
  }
}

// Singleton instance
export const queryCache = new QueryCache(100, 60000); // 100 entries, 60s TTL
