import { getDriver } from "~~/server/utils/neo4j";
import createRepository from "~~/repositories/neo4j/create-repository";

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>;

  const rawA = q?.a;
  const rawB = q?.b;

  const a = rawA ? String(rawA).trim() : "";
  const b = rawB ? String(rawB).trim() : "";

  if (!a || !b) {
    createError({
      statusCode: 400,
      statusMessage: "Missing source or target (a/b)",
    });
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    const repo = createRepository(session);
    const result = await repo.player.findPathBetweenPlayers(a, b);
    return result;
  } finally {
    await session.close();
  }
});
