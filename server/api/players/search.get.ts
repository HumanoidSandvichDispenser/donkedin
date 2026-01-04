import { getDriver } from "~~/server/utils/neo4j";
import createRepository from "~~/repositories/neo4j/create-repository";

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, any>;
  const rawSearch = typeof query.q === "string" ? query.q.trim() : "";

  if (!rawSearch) {
    return createError({
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
      return createError({
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
  } catch (error) {
    console.error("Error in player search handler:", error);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
