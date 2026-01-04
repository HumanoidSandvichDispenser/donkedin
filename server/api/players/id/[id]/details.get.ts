import { getDriver } from "~~/server/utils/neo4j";
import createRepository from "~~/repositories/neo4j/create-repository";
import RglService from "~~/services/rgl-service";
import Etf2lService from "~~/services/etf2l-service";
import PlayerService from "~~/services/player-service";
import { RglClient } from "~~/clients/rgl/RglClient";
import { Etf2lClient } from "~~/clients/etf2l/Etf2lClient";

const rglClient = new RglClient();
const etf2lClient = new Etf2lClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();
  const repo = createRepository(session);
  const rglService = new RglService(rglClient, repo);
  const etf2lService = new Etf2lService(etf2lClient, repo);
  const playerService = new PlayerService(rglService, etf2lService, repo);

  try {
    const q = getQuery(event) as Record<string, any>;
    let page = 0;
    if (q?.page !== undefined) {
      const parsed = parseInt(String(q.page), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        page = parsed;
      } else {
        throw createError({ statusCode: 400, statusMessage: "Invalid page" });
      }
    }

    // limit: optional query param, default 25, max 100
    let limit = 25;
    if (q?.limit !== undefined) {
      const parsed = parseInt(String(q.limit), 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        limit = parsed;
      } else {
        throw createError({ statusCode: 400, statusMessage: "Invalid limit" });
      }
    }

    const details = await playerService.getPlayerDetails(id, page, limit);
    if (!details) {
      throw createError({ statusCode: 404, statusMessage: "Player not found" });
    }
    return details;
  } finally {
    await session.close();
  }
});
