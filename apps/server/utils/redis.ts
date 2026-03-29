import RedisClient from "@codex/redis";

const redisClient = new RedisClient(
  process.env.REDIS_URL!,
  process.env.REDIS_PASSWORD!,
);

const cacheClient = new Proxy(redisClient as any, {
  get(target, prop, receiver) {
    const original = Reflect.get(target, prop, receiver);

    if (typeof original !== "function") {
      return original;
    }

    if (prop === "getCache") {
      return async (key: string) => {
        const value = await original.call(target, key);
        console.log(
          `[CACHE][FETCH] key=${key} status=${value === null || value === undefined ? "MISS" : "HIT"}`,
        );
        return value;
      };
    }

    if (prop === "setCache") {
      return async (key: string, value: unknown) => {
        const result = await original.call(target, key, value);
        console.log(`[CACHE][SET] key=${key}`);
        return result;
      };
    }

    if (prop === "invalidateCache") {
      return async (key: string) => {
        const result = await original.call(target, key);
        console.log(`[CACHE][REMOVE] key=${key}`);
        return result;
      };
    }

    return original.bind(target);
  },
});

export default cacheClient;
