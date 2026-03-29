import { beforeEach, describe, expect, it, mock } from "bun:test";

const redisMock = {
  getCache: mock(async (_key: string) => null as unknown),
  setCache: mock(async (_key: string, _value: unknown) => undefined),
  invalidateCache: mock(async (_key: string) => undefined),
};

mock.module("../utils/redis", () => ({
  default: redisMock,
}));

const {
  getCacheSafe,
  setCacheSafe,
  invalidateCacheSafe,
  invalidateManyCacheKeysSafe,
} = await import("../utils/cache");

describe("cache utils", () => {
  beforeEach(() => {
    redisMock.getCache.mockClear();
    redisMock.setCache.mockClear();
    redisMock.invalidateCache.mockClear();
  });

  it("parses cached JSON strings", async () => {
    redisMock.getCache.mockResolvedValueOnce('{"a":1}');

    const result = await getCacheSafe<{ a: number }>("k1");

    expect(result).toEqual({ a: 1 });
    expect(redisMock.getCache).toHaveBeenCalledWith("k1");
  });

  it("returns plain object values without parsing", async () => {
    redisMock.getCache.mockResolvedValueOnce({ ok: true });

    const result = await getCacheSafe<{ ok: boolean }>("k2");

    expect(result).toEqual({ ok: true });
  });

  it("returns null on invalid JSON cache payload", async () => {
    redisMock.getCache.mockResolvedValueOnce("not-json");

    const result = await getCacheSafe("k3");

    expect(result).toBeNull();
  });

  it("returns null when cache read throws", async () => {
    redisMock.getCache.mockRejectedValueOnce(new Error("redis-down"));

    const result = await getCacheSafe("k4");

    expect(result).toBeNull();
  });

  it("writes values without throwing even on redis errors", async () => {
    redisMock.setCache.mockRejectedValueOnce(new Error("write-failed"));

    await expect(setCacheSafe("k5", { x: 1 })).resolves.toBeUndefined();
    expect(redisMock.setCache).toHaveBeenCalledWith("k5", { x: 1 });
  });

  it("invalidates many keys safely", async () => {
    redisMock.invalidateCache.mockRejectedValueOnce(new Error("first-fails"));

    await expect(invalidateManyCacheKeysSafe(["a", "b", "c"]))
      .resolves
      .toBeUndefined();

    expect(redisMock.invalidateCache).toHaveBeenCalledTimes(3);
    expect(redisMock.invalidateCache).toHaveBeenNthCalledWith(1, "a");
    expect(redisMock.invalidateCache).toHaveBeenNthCalledWith(2, "b");
    expect(redisMock.invalidateCache).toHaveBeenNthCalledWith(3, "c");
  });

  it("invalidates single key safely", async () => {
    await expect(invalidateCacheSafe("single")).resolves.toBeUndefined();
    expect(redisMock.invalidateCache).toHaveBeenCalledWith("single");
  });
});
