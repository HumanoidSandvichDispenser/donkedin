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
}

export async function searchPlayersByAlias(
  session: neo4j.Session,
  alias: string,
  limit: number = 10,
) {
}
