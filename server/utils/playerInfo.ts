import neo4j from "neo4j-driver";
import type { PlayerProfile } from "~~/server/utils/fetchLeagues";

export async function upsertPlayerData(
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

export async function readPlayerData(session: neo4j.Session, id: string) {
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
