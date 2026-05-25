export const getCacheSafe = async <T>(_key: string): Promise<T | null> => null;

export const setCacheSafe = async (
  _key: string,
  _value: unknown,
): Promise<void> => {};

export const invalidateCacheSafe = async (_key: string): Promise<void> => {};

export const invalidateManyCacheKeysSafe = async (
  _keys: string[],
): Promise<void> => {};
