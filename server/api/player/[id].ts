import { getDriver } from "~~/server/utils/neo4j";
import { RglClient } from "~~/clients/rgl/RglClient";
import { Etf2lClient } from "~~/clients/etf2l/Etf2lClient";
import createRepository from "~~/repositories/neo4j/create-repository";
import RglService from "~~/services/rgl-service";
import Etf2lService from "~~/services/etf2l-service";
import PlayerService from "~~/services/player-service";

const rglClient = new RglClient({ BASE: "https://api.rgl.gg" });
const etf2lClient = new Etf2lClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) return createError({ statusCode: 400, statusMessage: "Missing id" });

  const driver = getDriver();
  const session = driver.session();
  try {
    const repo = createRepository(session);
    const rglService = new RglService(rglClient, repo);
    const etf2lService = new Etf2lService(etf2lClient, repo);
    const playerService = new PlayerService(rglService, etf2lService, repo);

    await playerService.fetchPlayer(id);
    return await repo.player.getPlayerWithTeamsById(id);
  } catch (err) {
    console.error("Error in player handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
