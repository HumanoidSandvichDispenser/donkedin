import { getDriver } from "@@/server/utils/neo4j";
import { RglClient } from "~~/server/lib/rgl/RglClient";
import { Etf2lClient } from "~~/server/lib/etf2l/Etf2lClient";
import { needsFetch } from "~~/server/utils/needsFetch";
import { fetchEtf2lExternalData, fetchRglExternalData } from "~~/server/utils/fetchLeagues";
import { fetchAvatarUrl } from "~~/server/utils/fetchAvatarUrl";
import { upsertPlayerData, readPlayerData } from "~~/server/utils/playerInfo";

const rglClient = new RglClient();
const etf2lClient = new Etf2lClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    // Decide whether we need to fetch
    const shouldFetch = await needsFetch(session, "Player", id, 3, "id");

    if (shouldFetch) {
      const [rglProfile, etf2lProfile, avatarUrl] = await Promise.allSettled([
        fetchRglExternalData(rglClient, id),
        fetchEtf2lExternalData(etf2lClient, id),
        fetchAvatarUrl(id),
      ]);

      const rglProfileVal = rglProfile.status == "fulfilled" ? rglProfile.value : null;
      const etf2lProfileVal = etf2lProfile.status == "fulfilled" ? etf2lProfile.value : null;
      const avatarUrlVal = avatarUrl.status == "fulfilled" ? avatarUrl.value : null;
      if (rglProfileVal || etf2lProfileVal) {
        // upsert fetched data
        await upsertPlayerData(session, id, {
          rglProfile: rglProfileVal,
          etf2lProfile: etf2lProfileVal,
          avatarUrl: avatarUrlVal,
        });
      }
    }

    // Always read and return the current DB state (after potential upsert)
    const out = await readPlayerData(session, id);
    return out;
  } catch (err) {
    console.error("Error in player handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
