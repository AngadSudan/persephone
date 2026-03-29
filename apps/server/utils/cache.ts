import cacheClient from "./redis";

const parseCachedValue = <T>(cachedValue: unknown): T | null => {
  if (cachedValue === null || cachedValue === undefined) {
    return null;
  }

  if (typeof cachedValue === "string") {
    try {
      return JSON.parse(cachedValue) as T;
    } catch {
      return null;
    }
  }

  return cachedValue as T;
};

export const getCacheSafe = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedValue = await cacheClient.getCache(key);
    return parseCachedValue<T>(cachedValue);
  } catch (error: any) {
    console.error(`Cache read failed for key ${key}:`, error?.message || error);
    return null;
  }
};

export const setCacheSafe = async (key: string, value: unknown): Promise<void> => {
  try {
    await cacheClient.setCache(key, value);
  } catch (error: any) {
    console.error(`Cache write failed for key ${key}:`, error?.message || error);
  }
};

export const invalidateCacheSafe = async (key: string): Promise<void> => {
  try {
    await cacheClient.invalidateCache(key);
  } catch (error: any) {
    console.error(
      `Cache invalidation failed for key ${key}:`,
      error?.message || error,
    );
  }
};

export const invalidateManyCacheKeysSafe = async (keys: string[]): Promise<void> => {
  await Promise.all(keys.map((key) => invalidateCacheSafe(key)));
};
