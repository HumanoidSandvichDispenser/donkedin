import type { LeagueTeamRepository, TeamWithPlayers } from "../types";
import type { TeamProfile } from "../../services/types";
import { Neo4jRepository } from "./repository";

import neo4j from "neo4j-driver";

abstract class Neo4jTeamRepository
  extends Neo4jRepository
  implements LeagueTeamRepository
{
  abstract needsFetch(id: number): Promise<boolean>;

  abstract getTeamWithPlayersById(id: number): Promise<TeamWithPlayers | null>;

  abstract upsertTeamProfile(team: TeamProfile): Promise<void>;
}

function neoIntToNumber(v: any) {
  if (v === undefined || v === null) return null;
  return neo4j.isInt(v) ? (v as neo4j.Integer).toNumber() : v;
}

export class Neo4jRglTeamRepository extends Neo4jTeamRepository {
  async needsFetch(id: number): Promise<boolean> {
    return super.needsFetchHelper("RglTeam", id, 3, "id");
  }

  async getTeamWithPlayersById(id: number) {
    const teamRes = await this.session.executeRead((tx) =>
      tx.run("MATCH (t:RglTeam {id: $id}) RETURN t", { id }),
    );
    if (teamRes.records.length === 0) {
      return null;
    }

    const tNode = teamRes.records[0]!.get("t");
    const team = {
      id: neoIntToNumber(tNode.properties.id),
      name: tNode.properties.name ?? null,
      tag: tNode.properties.tag ?? null,
      lastUpdated: tNode.properties.lastUpdated ?? null,
      seasonName: tNode.properties.seasonName ?? null,
      divisionName: tNode.properties.divisionName ?? null,
    };

    const playersRes = await this.session.executeRead((tx) =>
      tx.run("MATCH (pl:Player)-[:MEMBER_OF]->(t:RglTeam {id:$id}) RETURN pl", {
        id,
      }),
    );

    const players = playersRes.records.map((r: any) => {
      const pl = r.get("pl");
      return {
        id: pl.properties.id,
        name: pl.properties.rglName ?? pl.properties.etf2lName ?? null,
      };
    });

    return { team, players };
  }

  async upsertTeamProfile(team: TeamProfile) {
    const q = `
    MERGE (t:RglTeam {id: $id})
    SET t.name = $name, t.tag = $tag, t.lastUpdated = datetime()
    WITH t
    UNWIND $players AS p
      MERGE (pl:Player {id: p.id})
      SET pl.rglName = coalesce(p.name, pl.rglName)
      MERGE (pl)-[:MEMBER_OF]->(t)
    SET
      t.seasonid = $seasonId,
      t.seasonName = $seasonName,
      t.formatName = $formatName,
      t.divisionName = $divisionName
    RETURN t
    `;

    const params: any = {
      id: (team as any).teamId ?? team.id,
      name: (team as any).teamName ?? team.name ?? null,
      tag: (team as any).teamTag ?? team.tag ?? null,
      players: Array.isArray((team as any).players)
        ? (team as any).players.map((p: any) => ({
            id: p.id ?? p.steamId,
            name: p.name,
          }))
        : [],
      seasonId: (team as any).seasonId ?? null,
      seasonName: (team as any).seasonName ?? null,
      formatName: (team as any).formatName ?? null,
      divisionName:
        (team as any).divisionName ?? (team as any).divisionName ?? null,
    };

    await this.session.executeWrite((tx) => tx.run(q, params));
  }
}

export class Neo4jEtf2lTeamRepository extends Neo4jTeamRepository {
  async needsFetch(id: number): Promise<boolean> {
    return super.needsFetchHelper("Etf2lTeam", id, 3, "id");
  }

  async getTeamWithPlayersById(id: number) {
    const teamRes = await this.session.executeRead((tx) =>
      tx.run("MATCH (t:Etf2lTeam {id:$id}) RETURN t", { id }),
    );
    if (teamRes.records.length === 0) {
      return null;
    }

    const tNode = teamRes.records[0]!.get("t");
    const team = {
      id: neoIntToNumber(tNode.properties.id),
      name: tNode.properties.name ?? null,
      tag: tNode.properties.tag ?? null,
      lastUpdated: tNode.properties.lastUpdated ?? null,
    };

    const playersRes = await this.session.executeRead((tx) =>
      tx.run(
        "MATCH (pl:Player)-[:MEMBER_OF]->(t:Etf2lTeam {id:$id}) RETURN pl",
        { id },
      ),
    );

    const players = playersRes.records.map((r: any) => {
      const pl = r.get("pl");
      return {
        id: neoIntToNumber(pl.properties.id),
        name: pl.properties.etf2lName ?? pl.properties.rglName ?? null,
      };
    });

    return { team, players };
  }

  async upsertTeamProfile(team: TeamProfile) {
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

    const params: any = {
      id: (team as any).teamId ?? team.id,
      name: (team as any).teamName ?? team.name ?? null,
      tag: (team as any).teamTag ?? team.tag ?? null,
      players: Array.isArray((team as any).players)
        ? (team as any).players.map((p: any) => ({
            id: p.id ?? p.steamId,
            name: p.name,
          }))
        : [],
    };

    await this.session.executeWrite((tx) => tx.run(q, params));
  }
}
