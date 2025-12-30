import Redis from "ioredis";

let client: Redis.Redis | undefined;

export function getRedis(): Redis.Redis {
  if (client) {
    return client;
  }

  const url = process.env.REDIS_URL || process.env.REDIS;

  if (!url) {
    throw new Error("REDIS_URL not set");
  }

  client = new Redis(url);

  return client;
}

export async function closeRedis(): Promise<void> {
  if (!client) {
    return;
  }

  await client.quit();
  client = undefined;
}
