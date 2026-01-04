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
    // Use service method that only loads teams
    const teams = await playerService.getPlayerTeams(id);
    if (!teams) {
      throw createError({ statusCode: 404, statusMessage: "Player not found" });
    }

    const sortById = (a: any, b: any) => {
      const ai = typeof a.id === "number" ? a.id : parseInt(String(a.id), 10);
      const bi = typeof b.id === "number" ? b.id : parseInt(String(b.id), 10);
      return ai - bi;
    };

    const rgl = (teams.rgl ?? []).slice().sort(sortById);
    const etf2l = (teams.etf2l ?? []).slice().sort(sortById);

    return { teams: { rgl, etf2l } };
  } finally {
    await session.close();
  }
});
