import RedisClient from "@codex/redis";

const cacheClient = new RedisClient(
  process.env.REDIS_URL!,
  process.env.REDIS_PASSWORD!,
);

export default cacheClient;
