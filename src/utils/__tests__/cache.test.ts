import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager } from '../cache.js';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(1); // 1 second TTL for testing
  });

  afterEach(() => {
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', () => {
      cache.set('test-key', 'test-value');
      const value = cache.get('test-key');

      expect(value).toBe('test-value');
    });

    it('should return undefined for non-existent key', () => {
      const value = cache.get('non-existent');

      expect(value).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('existing-key', 'value');

      expect(cache.has('existing-key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should delete a key', () => {
      cache.set('to-delete', 'value');
      expect(cache.has('to-delete')).toBe(true);

      cache.del('to-delete');
      expect(cache.has('to-delete')).toBe(false);
    });

    it('should clear all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should support setting custom TTL per key', () => {
      // Test that TTL parameter is accepted (actual expiration tested in integration)
      const result = cache.set('custom-ttl-key', 'value', 10);
      expect(result).toBe(true);
      expect(cache.get('custom-ttl-key')).toBe('value');
    });
  });

  describe('Statistics', () => {
    it('should track cache hits', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key1'); // Hit

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(0);
    });

    it('should track cache misses', () => {
      cache.get('non-existent-1'); // Miss
      cache.get('non-existent-2'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('non-existent'); // Miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe('50.00%');
    });

    it('should track number of keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.getStats().keys).toBe(2);

      cache.del('key1');
      expect(cache.getStats().keys).toBe(1);
    });

    it('should reset stats on clear', () => {
      cache.set('key1', 'value1');
      cache.get('key1');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.keys).toBe(0);
    });
  });

  describe('wrap() Helper', () => {
    it('should cache async function result', async () => {
      let callCount = 0;
      const fetchFn = async () => {
        callCount++;
        return 'fetched-data';
      };

      const result1 = await cache.wrap('async-key', fetchFn);
      const result2 = await cache.wrap('async-key', fetchFn);

      expect(result1).toBe('fetched-data');
      expect(result2).toBe('fetched-data');
      expect(callCount).toBe(1); // Function only called once
    });

    it('should use cached value and track hit', async () => {
      const fetchFn = async () => 'data';

      await cache.wrap('wrap-key', fetchFn);

      const stats = cache.getStats();
      expect(stats.misses).toBe(1); // First call is a miss

      await cache.wrap('wrap-key', fetchFn);

      const stats2 = cache.getStats();
      expect(stats2.hits).toBe(1); // Second call is a hit
    });

    it('should support custom TTL in wrap', async () => {
      const fetchFn = async () => 'data';

      await cache.wrap('wrap-ttl', fetchFn, 0.5);

      expect(cache.get('wrap-ttl')).toBe('data');

      await new Promise(resolve => setTimeout(resolve, 700));
      expect(cache.get('wrap-ttl')).toBeUndefined();
    });

    it('should handle async errors', async () => {
      const fetchFn = async () => {
        throw new Error('Fetch failed');
      };

      await expect(
        cache.wrap('error-key', fetchFn)
      ).rejects.toThrow('Fetch failed');
    });
  });

  describe('Complex Data Types', () => {
    it('should cache objects', () => {
      const obj = { name: 'test', count: 42 };
      cache.set('obj-key', obj);

      const cached = cache.get<typeof obj>('obj-key');
      expect(cached).toEqual(obj);
    });

    it('should cache arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('arr-key', arr);

      const cached = cache.get<number[]>('arr-key');
      expect(cached).toEqual(arr);
    });
  });
});