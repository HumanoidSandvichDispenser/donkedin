import { Etf2lClient } from "~~/clients/etf2l/Etf2lClient";
import createRepository from "~~/repositories/neo4j/create-repository";
import Etf2lService from "~~/services/etf2l-service";

const etf2lClient = new Etf2lClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();
  try {
    const repo = createRepository(session);
    const service = new Etf2lService(etf2lClient, repo);
    const team = await service.getTeam(Number(id));
    if (!team) {
      throw createError({ statusCode: 404, statusMessage: "Team not found" });
    }
    return team;
  } finally {
    await session.close();
  }
});
