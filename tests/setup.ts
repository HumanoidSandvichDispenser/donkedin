import { vi } from "vitest";

// Provide a minimal mock for getRedis if needed
vi.mock("../server/utils/redis", () => ({
  getRedis: () => ({
    exists: async () => 0,
    incr: async () => 1,
    hset: async () => 1,
    hget: async () => null,
    zadd: async () => 1,
  }),
}));
