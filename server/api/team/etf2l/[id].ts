import { getDriver } from "@@/server/utils/neo4j";
import neo4j from "neo4j-driver";
import { Etf2lClient } from "@@/server/lib/etf2l/Etf2lClient";
import { needsFetch } from "@@/server/utils/needsFetch";
import { fetchEtf2lTeam } from "~~/server/utils/fetchLeagues";
import type { TeamProfile } from "~~/server/utils/fetchLeagues";

const etf2l = new Etf2lClient({ BASE: "https://api-v2.etf2l.org" });

async function upsertEtf2lTeam(session: neo4j.Session, team: TeamProfile) {
  const q = `
    MERGE (t:Etf2lTeam {id: $id})
    SET t.name = $name, t.tag = $tag, t.lastUpdated = datetime()
    WITH t
    UNWIND $players AS p
      MERGE (pl:Player {id: p.id})
      SET pl.etf2lName = coalesce(p.name, pl.etf2lName)
      MERGE (pl)-[:MEMBER_OF]->(t)
    RETURN t
  `;

  const params = {
    id: team.teamId,
    name: team.teamName ?? null,
    tag: team.teamTag,
    players: Array.isArray(team.players)
      ? team.players.map((p) => ({ id: p.steamId, name: p.name }))
      : [],
  };

  await session.executeWrite((tx) => tx.run(q, params));
}

async function readEtf2lTeam(session: neo4j.Session, id: Number) {
  const teamRes = await session.executeRead((tx) =>
    tx.run("MATCH (t:Etf2lTeam {id:$id}) RETURN t", { id }),
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
    lastUpdated: tNode.properties.lastUpdated ?? null,
  };

  const playersRes = await session.executeRead((tx) =>
    tx.run("MATCH (pl:Player)-[:MEMBER_OF]->(t:Etf2lTeam {id:$id}) RETURN pl", {
      id,
    }),
  );

  const players = playersRes.records.map((r) => {
    const pl = r.get("pl");
    return {
      id: neo4j.isInt(pl.properties.id)
        ? (pl.properties.id as neo4j.Integer).toNumber()
        : pl.properties.id,
      name: pl.properties.etf2lName ?? pl.properties.rglName ?? null,
    };
  });

  return { found: true, team: teamOut, players };
}

export default defineEventHandler(async (event) => {
  const { id, force } = event.context.params as {
    id: string;
    force: boolean | undefined;
  };

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    const shouldFetch = await needsFetch(session, "Etf2lTeam", id, 3, "id");

    if (shouldFetch) {
      // etf2l team API expects numeric clan id
      const teamProfile = await fetchEtf2lTeam(etf2l, id);
      if (teamProfile) {
        await upsertEtf2lTeam(session, teamProfile);
      }
    }

    const out = await readEtf2lTeam(session, Number(id));
    return out;
  } catch (err) {
    console.error("Error in ETF2L team handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
