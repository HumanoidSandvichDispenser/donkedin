import { getDriver } from "@@/server/utils/neo4j";
import neo4j from "neo4j-driver";
import { RglClient } from "~~/server/lib/rgl/RglClient";
import { Etf2lClient } from "~~/server/lib/etf2l/Etf2lClient";
import { needsFetch } from "~~/server/utils/needsFetch";
import { fetchEtf2lExternalData, fetchRglExternalData } from "~~/server/utils/fetchLeagues";
import { fetchAvatarUrl } from "~~/server/utils/fetchAvatarUrl";
import type { PlayerProfile, TeamSummary } from "~~/server/utils/fetchLeagues";

const rglClient = new RglClient();
const etf2lClient = new Etf2lClient();

// Helper: upsert fetched data into Neo4j and set lastUpdated
async function upsertPlayerData(
  session: neo4j.Session,
  id: string,
  data: {
    rglProfile: PlayerProfile | null;
    etf2lProfile: PlayerProfile | null;
    avatarUrl?: string | null;
  },
) {
  const writeQuery = `
    MERGE (p:Player {id: $id})
    SET p.rglName = coalesce($rglName, p.rglName),
        p.etf2lName = coalesce($etf2lName, p.etf2lName),
        p.avatarUrl = coalesce($avatarUrl, p.avatarUrl),
        p.lastUpdated = datetime()
    WITH p
    UNWIND $rglTeams AS rt
      MERGE (t:RglTeam {id: rt.teamId})
      SET t.name = rt.teamName
      MERGE (p)-[:MEMBER_OF]->(t)
    WITH p
    UNWIND $etf2lTeams AS et
      MERGE (t2:Etf2lTeam {id: et.teamId})
      SET t2.name = et.teamName
      MERGE (p)-[:MEMBER_OF]->(t2)
    RETURN p
  `;

  const params: any = {
    id,
    rglName: data.rglProfile?.name ?? null,
    etf2lName: data.etf2lProfile?.name ?? null,
    rglTeams: data.rglProfile?.teams ?? [],
    etf2lTeams: data.etf2lProfile?.teams ?? [],
    avatarUrl: data.avatarUrl,
  };

  await session.executeWrite((tx) => tx.run(writeQuery, params));
}

// Helper: read player and team info from Neo4j
async function readPlayerData(session: neo4j.Session, id: string) {
  const playerRes = await session.executeRead((tx) =>
    tx.run("MATCH (p:Player {id:$id}) RETURN p", { id }),
  );
  if (playerRes.records.length === 0) {
    return { found: false };
  }

  const pNode = playerRes.records[0].get("p");
  const playerOut = {
    id,
    rglName: pNode.properties?.rglName ?? null,
    etf2lName: pNode.properties?.etf2lName ?? null,
    lastUpdated: pNode.properties?.lastUpdated ?? null,
  };

  const rglTeamsResRead = await session.executeRead((tx) =>
    tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:RglTeam) RETURN t", {
      id,
    }),
  );

  const etf2lTeamsResRead = await session.executeRead((tx) =>
    tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:Etf2lTeam) RETURN t", {
      id,
    }),
  );

  const rglTeamsOut = rglTeamsResRead.records.map((r) => {
    const t = r.get("t");
    return {
      teamId: neo4j.isInt(t.properties.id)
        ? (t.properties.id as neo4j.Integer).toNumber()
        : t.properties.id,
      teamName: t.properties.name ?? null,
    };
  });

  const etf2lTeamsOut = etf2lTeamsResRead.records.map((r) => {
    const t = r.get("t");
    return {
      id: neo4j.isInt(t.properties.id)
        ? (t.properties.id as neo4j.Integer).toNumber()
        : t.properties.id,
      name: t.properties.name ?? null,
    };
  });

  return {
    found: true,
    player: playerOut,
    teams: {
      rgl: rglTeamsOut,
      etf2l: etf2lTeamsOut,
    },
  };
}

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
