import { getDriver } from "@@/server/utils/neo4j";
import neo4j from "neo4j-driver";
import { RglClient } from "@@/server/lib/rgl/RglClient";
import { Etf2lClient } from "@@/server/lib/etf2l/Etf2lClient";
import { RglPlayer, RglPlayerTeam } from "@/server/lib/rgl/types";
import { Etf2lPlayer } from "@/server/lib/etf2l/types";

const rglClient = new RglClient({
  BASE: "https://api.rgl.gg"
});
const etf2lClient = new Etf2lClient({
  BASE: "https://api-v2.etf2l.org"
});

/**
 * Gets and upserts player data from RGL and ETF2L into Neo4j. Retrieves
 * information such as aliases and team memberships from both platforms.
 * This should only populate the player node with RGL and ETF2L aliases,
 * create team nodes, and create relationships between the player and their
 * teams. This should not handle any teammate relationships or other data.
 *
 * Currently, this should only return a player and their teams from both
 * leagues.
 */
export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  // fetch external data in parallel
  const [rglProfileRes, rglTeamsRes, etf2lRes] = await Promise.allSettled([
    rglClient.profile.getV0Profile(id),
    rglClient.profile.getV0ProfileTeams(id),
    etf2lClient.player.getPlayer(id),
  ]);

  const rglProfile: RglPlayer | null =
    rglProfileRes.status === "fulfilled" ? (rglProfileRes.value as RglPlayer) : null;
  const rglTeams: RglPlayerTeam[] =
    rglTeamsRes.status === "fulfilled" ? (rglTeamsRes.value as RglPlayerTeam[]) : [];
  const etf2lPlayer: Etf2lPlayer | null =
    etf2lRes.status === "fulfilled" ? (etf2lRes.value as Etf2lPlayer) : null;

  const driver = getDriver();
  const session = driver.session();

  try {
    // upsert player node with aliases and create team nodes + relationships
    const writeQuery = `
      MERGE (p:Player {id: $id})
      SET p.rglName = coalesce($rglName, p.rglName),
          p.etf2lName = coalesce($etf2lName, p.etf2lName)
      WITH p
      // RGL teams
      UNWIND $rglTeams AS rt
        MERGE (t:RglTeam {id: rt.teamId})
        SET t.name = rt.teamName
        MERGE (p)-[:MEMBER_OF]->(t)
      WITH p
      // ETF2L teams
      UNWIND $etf2lTeams AS et
        MERGE (t2:Etf2lTeam {id: et.id})
        SET t2.name = et.name
        MERGE (p)-[:MEMBER_OF]->(t2)
      RETURN p
    `;

    const params: any = {
      id,
      rglName: rglProfile ? rglProfile.name : null,
      etf2lName: etf2lPlayer ? etf2lPlayer.player.name : null,
      rglTeams: rglTeams.map((t) => ({ teamId: t.teamId, teamName: t.teamName, leftAt: t.leftAt ?? null })),
      etf2lTeams: etf2lPlayer && Array.isArray((etf2lPlayer as Etf2lPlayer).player.teams)
        ? (etf2lPlayer as Etf2lPlayer).player.teams.map((t) => ({ id: t.id, name: t.name }))
        : [],
    };

    await session.executeWrite((tx) => tx.run(writeQuery, params));

    // read back player and teams (only teams from both leagues)
    const query = "MATCH (p:Player {id:$id}) RETURN p";
    const playerRes = await session.executeRead((tx) => tx.run(query, { id }));

    if (playerRes.records.length === 0) {
      return { found: false };
    }

    const pNode = playerRes.records[0].get("p");
    const playerOut = {
      id,
      rglName: pNode.properties?.rglName ?? null,
      etf2lName: pNode.properties?.etf2lName ?? null,
    };

    const rglTeamsResRead = await session.executeRead((tx) =>
      tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:RglTeam) RETURN t", { id }),
    );

    const etf2lTeamsResRead = await session.executeRead((tx) =>
      tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:Etf2lTeam) RETURN t", { id }),
    );

    const rglTeamsOut = rglTeamsResRead.records.map((r) => {
      const t = r.get("t");
      return {
        teamId: neo4j.isInt(t.properties.id) ? (t.properties.id as neo4j.Integer).toNumber() : t.properties.id,
        teamName: t.properties.name ?? null,
      };
    });

    const etf2lTeamsOut = etf2lTeamsResRead.records.map((r) => {
      const t = r.get("t");
      return {
        id: neo4j.isInt(t.properties.id) ? (t.properties.id as neo4j.Integer).toNumber() : t.properties.id,
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
  } catch (err) {
    console.error("Error in player upsert/read:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
