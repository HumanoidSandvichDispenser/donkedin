import { getDriver } from "~~/server/utils/neo4j";
import createRepository from "~~/repositories/neo4j/create-repository";

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, any>;
  const rawSearch = typeof query.q === "string" ? query.q.trim() : "";

  if (!rawSearch) {
    createError({
      statusCode: 400,
      statusMessage: "Missing search query",
    });
  }

  let limit = 10;
  if (query.limit !== undefined) {
    const parsedLimit = parseInt(String(query.limit), 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 50);
    } else {
      createError({
        statusCode: 400,
        statusMessage: "Invalid limit",
      });
    }
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    const repo = createRepository(session);
    const players = await repo.player.searchPlayersByAlias(rawSearch, limit);
    return { players };
  } finally {
    await session.close();
  }
});
