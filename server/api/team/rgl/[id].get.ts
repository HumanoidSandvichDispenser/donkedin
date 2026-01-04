import { getDriver } from "~~/server/utils/neo4j";
import { RglClient } from "~~/clients/rgl/RglClient";
import createRepository from "~~/repositories/neo4j/create-repository";
import RglService from "~~/services/rgl-service";

const rglClient = new RglClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();
  try {
    const repo = createRepository(session);
    const service = new RglService(rglClient, repo);
    const team = await service.getTeam(Number(id));
    if (!team) {
      throw createError({ statusCode: 404, statusMessage: "Team not found" });
    }
    return team;
  } finally {
    await session.close();
  }
});
