/**
 * API Cache System
 * Caches responses from external APIs (GEE, NASA FIRMS) to reduce API calls and improve performance
 * Uses Prisma ApiCache table for storage
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export enum CacheSource {
  GEE_ANALYZE_AREA = 'GEE_ANALYZE_AREA',
  GEE_HISTORICAL_TRENDS = 'GEE_HISTORICAL_TRENDS',
  NASA_FIRMS = 'NASA_FIRMS',
}

export const CACHE_TTL = {
  [CacheSource.GEE_ANALYZE_AREA]: 24 * 60 * 60 * 1000, // 24 hours
  [CacheSource.GEE_HISTORICAL_TRENDS]: 24 * 60 * 60 * 1000, // 24 hours
  [CacheSource.NASA_FIRMS]: 3 * 60 * 60 * 1000, // 3 hours
};

/**
 * Generate a cache key from parameters
 */
export function generateCacheKey(source: CacheSource, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const paramsString = JSON.stringify(sortedParams);
  const hash = crypto.createHash('sha256').update(paramsString).digest('hex');

  return `${source}:${hash}`;
}

/**
 * Get cached data if it exists and is not expired
 */
export async function getCachedData<T>(
  source: CacheSource,
  params: Record<string, any>
): Promise<T | null> {
  try {
    const cacheKey = generateCacheKey(source, params);
    const ttl = CACHE_TTL[source];

    const cached = await prisma.apiCache.findUnique({
      where: { cacheKey },
    });

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = new Date();
    const expiresAt = new Date(cached.createdAt.getTime() + ttl);

    if (now > expiresAt) {
      // Cache expired, delete it
      await prisma.apiCache.delete({
        where: { cacheKey },
      });
      return null;
    }

    // Parse and return cached data
    return JSON.parse(cached.response) as T;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Store data in cache
 */
export async function setCachedData(
  source: CacheSource,
  params: Record<string, any>,
  data: any
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(source, params);

    await prisma.apiCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        source,
        request: JSON.stringify(params),
        response: JSON.stringify(data),
      },
      update: {
        request: JSON.stringify(params),
        response: JSON.stringify(data),
        createdAt: new Date(), // Reset creation time on update
      },
    });
  } catch (error) {
    console.error('Error writing to cache:', error);
    // Don't throw error, just log it - caching failure shouldn't break the app
  }
}

/**
 * Invalidate cache for a specific source and params
 */
export async function invalidateCache(
  source: CacheSource,
  params: Record<string, any>
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(source, params);

    await prisma.apiCache.delete({
      where: { cacheKey },
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Clear all expired cache entries (for maintenance)
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const now = new Date();

    // Get all cache entries
    const allCache = await prisma.apiCache.findMany();

    let deletedCount = 0;

    for (const cache of allCache) {
      const source = cache.source as CacheSource;
      const ttl = CACHE_TTL[source] || CACHE_TTL[CacheSource.GEE_ANALYZE_AREA];
      const expiresAt = new Date(cache.createdAt.getTime() + ttl);

      if (now > expiresAt) {
        await prisma.apiCache.delete({
          where: { cacheKey: cache.cacheKey },
        });
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return 0;
  }
}

/**
 * Clear all cache for a specific source
 */
export async function clearCacheBySource(source: CacheSource): Promise<number> {
  try {
    const result = await prisma.apiCache.deleteMany({
      where: { source },
    });

    return result.count;
  } catch (error) {
    console.error('Error clearing cache by source:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  entriesBySource: Record<string, number>;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  try {
    const allCache = await prisma.apiCache.findMany({
      select: {
        source: true,
        createdAt: true,
      },
    });

    const entriesBySource: Record<string, number> = {};

    for (const cache of allCache) {
      entriesBySource[cache.source] = (entriesBySource[cache.source] || 0) + 1;
    }

    const sortedByDate = allCache.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    return {
      totalEntries: allCache.length,
      entriesBySource,
      oldestEntry: sortedByDate[0]?.createdAt || null,
      newestEntry: sortedByDate[sortedByDate.length - 1]?.createdAt || null,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      entriesBySource: {},
      oldestEntry: null,
      newestEntry: null,
    };
  }
}

/**
 * Wrapper function to use cache with any async function
 */
export async function withCache<T>(
  source: CacheSource,
  params: Record<string, any>,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedData<T>(source, params);

  if (cached !== null) {
    console.log(`✓ Cache hit for ${source}`);
    return cached;
  }

  // Cache miss, fetch data
  console.log(`✗ Cache miss for ${source}, fetching...`);
  const data = await fetchFn();

  // Store in cache
  await setCachedData(source, params, data);

  return data;
}
