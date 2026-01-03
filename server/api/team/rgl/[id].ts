import { getDriver } from "~~/server/utils/neo4j";
import neo4j from "neo4j-driver";
import { RglClient } from "~~/server/lib/rgl/RglClient";
import type { RglTeam, RglSeason } from "~~/server/lib/rgl/types";
import { needsFetch } from "~~/server/utils/needsFetch";
import { fetchRglSeason } from "~~/server/utils/fetchRglSeason";

const rglClient = new RglClient({ BASE: "https://api.rgl.gg" });

// Upsert RGL team data and players
async function upsertRglTeam(
  session: neo4j.Session,
  team: RglTeam,
  season: RglSeason,
) {
  const q = `
    MERGE (t:RglTeam {id: $id})
    SET t.name = $name, t.tag = $tag, t.lastUpdated = datetime()
    WITH t
    UNWIND $players AS p
      MERGE (pl:Player {id: p.steamId})
      SET pl.rglName = coalesce(p.name, pl.rglName)
      MERGE (pl)-[:MEMBER_OF]->(t)
    SET
      t.seasonid = $seasonId,
      t.seasonName = $seasonName,
      t.formatName = $formatName,
      t.divisionName = $divisionName
    RETURN t
  `;

  const params = {
    id: team.teamId,
    name: team.name,
    tag: team.tag,
    players: team.players.map((p) => ({
      steamId: p.steamId,
      name: p.name,
    })),
    seasonId: team.seasonId,
    seasonName: season.name,
    formatName: season.formatName,
    divisionName: team.divisionName,
  };

  await session.executeWrite((tx) => tx.run(q, params));
}

// Read RGL team and its players
async function readRglTeam(session: neo4j.Session, id: Number) {
  const teamRes = await session.executeRead((tx) =>
    tx.run("MATCH (t:RglTeam {id: $id}) RETURN t", { id }),
  );
  if (teamRes.records.length === 0)
    return {
      found: false,
    };

  const tNode = teamRes.records[0].get("t");
  const teamOut: any = {
    id: neo4j.isInt(tNode.properties.id)
      ? (tNode.properties.id as neo4j.Integer).toNumber()
      : tNode.properties.id,
    name: tNode.properties.name ?? null,
    tag: tNode.properties.tag ?? null,
    lastUpdated: tNode.properties.lastUpdated ?? null,
    seasonName: tNode.properties.seasonName ?? null,
    divisionName: tNode.properties.divisionName ?? null,
  };

  const playersRes = await session.executeRead((tx) =>
    tx.run("MATCH (pl:Player)-[:MEMBER_OF]->(t:RglTeam {id:$id}) RETURN pl", {
      id,
    }),
  );

  const players = playersRes.records.map((r) => {
    const pl = r.get("pl");
    return {
      id: pl.properties.id,
      name: pl.properties.rglName ?? pl.properties.etf2lName ?? null,
    };
  });

  return { found: true, team: teamOut, players };
}

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    const shouldFetch = await needsFetch(session, "RglTeam", id, 3, "id");

    if (shouldFetch) {
      const team = await rglClient.teams.getV0Teams(Number(id));
      if (team) {
        const season = await fetchRglSeason(rglClient, team.seasonId);
        if (season) {
          await upsertRglTeam(session, team, season);
        }
      }
    }

    const out = await readRglTeam(session, Number(id));
    return out;
  } catch (err) {
    console.error("Error in RGL team handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
