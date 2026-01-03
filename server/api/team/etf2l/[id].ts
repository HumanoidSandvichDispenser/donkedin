import { Etf2lClient } from "~~/clients/etf2l/Etf2lClient";
import createRepository from "~~/repositories/neo4j/create-repository";
import Etf2lService from "~~/services/etf2l-service";

const etf2lClient = new Etf2lClient({ BASE: "https://api-v2.etf2l.org" });

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) return createError({ statusCode: 400, statusMessage: "Missing id" });

  const driver = getDriver();
  const session = driver.session();
  try {
    const repo = createRepository(session);
    const service = new Etf2lService(etf2lClient, repo);
    return await service.getTeam(Number(id));
  } catch (err) {
    console.error("Error in ETF2L team handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
