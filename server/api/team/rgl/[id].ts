import { getDriver } from "~~/server/utils/neo4j";
import { RglClient } from "~~/clients/rgl/RglClient";
import createRepository from "~~/repositories/neo4j/create-repository";
import RglService from "~~/services/rgl-service";

const rglClient = new RglClient({ BASE: "https://api.rgl.gg" });

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) return createError({ statusCode: 400, statusMessage: "Missing id" });

  const driver = getDriver();
  const session = driver.session();
  try {
    const repo = createRepository(session);
    const service = new RglService(rglClient, repo);
    return await service.getTeam(Number(id));
  } catch (err) {
    console.error("Error in RGL team handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
