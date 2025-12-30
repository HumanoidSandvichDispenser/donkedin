import { getRedis } from "../utils/redis";

const MULT = 1000000; // multiplier for composite score
const SEQ_KEY = "fetch:seq";
const QUEUE_KEY = "fetch:queue";
const META_PREFIX = "fetch:meta:";

export type FetchType = "player" | "rgl_team" | "etf2l_team";

function memberKey(type: FetchType, id: string): string {
  return `${type}:${id}`;
}

export async function enqueueFetch(
  type: FetchType,
  id: string,
): Promise<{ enqueued: boolean; member: string }> {
  const client = getRedis();
  const member = memberKey(type, id);
  const metaKey = `${META_PREFIX}${member}`;

  // Check if meta exists
  const exists = await client.exists(metaKey);

  if (!exists) {
    // New item: create meta with last_fetch = 0 (never fetched)
    const seq = await client.incr(SEQ_KEY);

    await client.hset(metaKey, {
      created_at: Date.now().toString(),
      last_fetch: "0",
      type,
    });

    const score = BigInt(0) * BigInt(MULT) + BigInt(seq);

    await client.zadd(QUEUE_KEY, score.toString(), member);

    return { enqueued: true, member };
  }

  // Existing item: use stored last_fetch
  const lastFetch = await client.hget(metaKey, "last_fetch");
  const lf = lastFetch ? Number(lastFetch) : 0;
  const seq = await client.incr(SEQ_KEY);
  const score = BigInt(lf) * BigInt(MULT) + BigInt(seq);

  await client.zadd(QUEUE_KEY, score.toString(), member);

  return { enqueued: true, member };
}
