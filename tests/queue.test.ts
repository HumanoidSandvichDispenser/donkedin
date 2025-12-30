import { vi, describe, it, expect, beforeEach } from "vitest";

// mock Redis implementation
function createFakeRedis() {
  const metaStore: Record<string, Record<string, string>> = {};
  const zset: Array<{ score: string; member: string }> = [];
  let seq = 0;

  return {
    exists: async (key: string) => {
      return metaStore[key] ? 1 : 0;
    },
    incr: async (key: string) => {
      seq += 1;
      return seq;
    },
    hset: async (key: string, obj: Record<string, string>) => {
      metaStore[key] = { ...(metaStore[key] || {}), ...obj };
      return 1;
    },
    hget: async (key: string, field: string) => {
      return metaStore[key] ? (metaStore[key][field] ?? null) : null;
    },
    zadd: async (_key: string, score: string, member: string) => {
      zset.push({ score, member });
      return 1;
    },
    // helpers for assertions
    _getZset: () => zset,
    _getMeta: () => metaStore,
    _reset: () => {
      seq = 0;
      for (const k of Object.keys(metaStore)) {
        delete metaStore[k];
      }
      zset.length = 0;
    },
  };
}

// mock the server/utils/redis module before importing the queue
const fakeRedis = createFakeRedis();
vi.mock("../server/utils/redis", () => ({
  getRedis: () => fakeRedis,
}));

import { enqueueFetch } from "../server/lib/queue";

describe("enqueueFetch", () => {
  beforeEach(() => {
    fakeRedis._reset();
  });

  it("should enqueue a new player with last_fetch=0 and add meta", async () => {
    const { enqueued, member } = await enqueueFetch("player", "12345");
    expect(enqueued).toBe(true);
    expect(member).toBe("player:12345");

    const meta = fakeRedis._getMeta();
    expect(meta["fetch:meta:player:12345"]).toBeDefined();
    expect(meta["fetch:meta:player:12345"].last_fetch).toBe("0");

    const z = fakeRedis._getZset();
    expect(z.length).toBe(1);
    expect(z[0].member).toBe("player:12345");
    // score should be a string number (seq == 1)
    expect(z[0].score).toBe("1");
  });

  it("should enqueue an existing item using its last_fetch", async () => {
    // pre-seed meta
    await fakeRedis.hset("fetch:meta:player:999", {
      created_at: Date.now().toString(),
      last_fetch: "1000",
      type: "player",
    });

    const res = await enqueueFetch("player", "999");
    expect(res.enqueued).toBe(true);
    expect(res.member).toBe("player:999");

    const z = fakeRedis._getZset();
    expect(z.length).toBe(1);

    // seq will be 1 (since reset) so score = last_fetch*MULT + seq, but our
    // fake Redis stores only the computed string we check that member is
    // correct and score is numeric string
    expect(z[0].member).toBe("player:999");
    expect(/^[0-9]+$/.test(z[0].score)).toBe(true);
  });

  it("should allow enqueuing different types", async () => {
    await enqueueFetch("rgl_team", "42");
    await enqueueFetch("etf2l_team", "abc");

    const z = fakeRedis._getZset();
    const members = z.map((e) => e.member).sort();
    expect(members).toEqual(["etf2l_team:abc", "rgl_team:42"].sort());
  });

  it("should increment sequence correctly", async () => {
    const a = await enqueueFetch("player", "a");
    const b = await enqueueFetch("player", "b");

    const z = fakeRedis._getZset();
    expect(z.length).toBe(2);

    // scores should be "1" and "2" respectively for new items
    const scores = z.map((e) => e.score);
    expect(scores).toContain("1");
    expect(scores).toContain("2");
  });

  it("should prioritize by last_fetch", async () => {
    // seed two items with different last_fetch values
    await fakeRedis.hset("fetch:meta:player:old", {
      created_at: Date.now().toString(),
      last_fetch: "1000",
      type: "player",
    });
    await fakeRedis.hset("fetch:meta:player:new", {
      created_at: Date.now().toString(),
      last_fetch: "2000",
      type: "player",
    });

    await enqueueFetch("player", "old");
    await enqueueFetch("player", "new");

    const z = fakeRedis._getZset();
    expect(z.length).toBe(2);

    const scoreMap: Record<string, number> = {};
    for (const e of z) {
      scoreMap[e.member] = Number(e.score);
    }

    // older last_fetch should give smaller score (higher priority)
    expect(scoreMap["player:old"]).toBeLessThan(scoreMap["player:new"]);
  });
});
