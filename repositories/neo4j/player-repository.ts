import type { PlayerProfile } from "../../services/types";
import type { PlayerNode, PlayerRepository, PlayerWithTeams } from "../types";
import { Neo4jRepository } from "./repository";
import neo4j from "neo4j-driver";
import { serializeNode } from "~~/server/utils/neo4j";

export default class Neo4jPlayerRepository
  extends Neo4jRepository
  implements PlayerRepository
{
  async needsFetch(id: string): Promise<boolean> {
    return super.needsFetchHelper("Player", id, 3, "id");
  }

  async getPlayerWithTeamsById(id: string): Promise<PlayerWithTeams | null> {
    const playerRes = await this.session.executeRead((tx) =>
      tx.run("MATCH (p:Player {id:$id}) RETURN p", { id }),
    );
    if (playerRes.records.length === 0) {
      return null;
    }

    const pNode = playerRes.records[0].get("p");
    const playerOut = {
      id,
      rglName: pNode.properties?.rglName ?? null,
      etf2lName: pNode.properties?.etf2lName ?? null,
      lastUpdated: pNode.properties?.lastUpdated ?? null,
      avatarUrl: pNode.properties?.avatarUrl ?? null,
    };

    const rglTeamsResRead = await this.session.executeRead((tx) =>
      tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:RglTeam) RETURN t", {
        id,
      }),
    );

    const etf2lTeamsResRead = await this.session.executeRead((tx) =>
      tx.run("MATCH (p:Player {id:$id})-[:MEMBER_OF]->(t:Etf2lTeam) RETURN t", {
        id,
      }),
    );

    const rglTeamsOut = rglTeamsResRead.records.map((r) => {
      const t = r.get("t");
      return {
        id: neo4j.isInt(t.properties.id)
          ? (t.properties.id as neo4j.Integer).toNumber()
          : t.properties.id,
        name: t.properties.name ?? null,
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
      player: playerOut,
      teams: {
        rgl: rglTeamsOut,
        etf2l: etf2lTeamsOut,
      },
    };
  }

  async searchPlayersByAlias(
    alias: string,
    limit: number = 25,
  ): Promise<PlayerNode[]> {
    const query = `
      CALL db.index.fulltext.queryNodes("playerNames", $alias + "*") YIELD node, score
      RETURN node, score
      ORDER BY score DESC
      LIMIT $limit
    `;

    const params: any = {
      alias,
      limit: neo4j.int(limit),
    };
    const res = await this.session.executeRead((tx) => tx.run(query, params));

    return res.records.map((r) => {
      const node = r.get("node");
      const props = node?.properties ?? {};
      const id = neo4j.isInt(props.id)
        ? (props.id as neo4j.Integer).toNumber()
        : props.id;
      return {
        id: id,
        rglName: props.rglName ?? null,
        etf2lName: props.etf2lName ?? null,
        avatarUrl: props.avatarUrl ?? null,
        lastUpdated: props.lastUpdated ?? null,
      };
    });
  }

  async upsertPlayerProfile(
    id: string,
    profiles: {
      rgl?: PlayerProfile;
      etf2l?: PlayerProfile;
    },
    avatarUrl?: string,
  ): Promise<void> {
    const writeQuery = `
      MERGE (p:Player {id: $id})
      SET p.rglName = coalesce($rglName, p.rglName),
          p.etf2lName = coalesce($etf2lName, p.etf2lName),
          p.avatarUrl = coalesce($avatarUrl, p.avatarUrl),
          p.lastUpdated = datetime()
      WITH p
      UNWIND $rglTeams AS rt
        MERGE (t:RglTeam {id: rt.id})
        SET t.name = rt.name
        MERGE (p)-[:MEMBER_OF]->(t)
      WITH p
      UNWIND $etf2lTeams AS et
        MERGE (t2:Etf2lTeam {id: et.id})
        SET t2.name = et.name
        MERGE (p)-[:MEMBER_OF]->(t2)
      RETURN p
    `;

    const params: any = {
      id,
      avatarUrl,
      rglName: profiles.rgl?.name ?? null,
      etf2lName: profiles.etf2l?.name ?? null,
      rglTeams: profiles.rgl?.teams ?? [],
      etf2lTeams: profiles.etf2l?.teams ?? [],
    };

    await this.session.executeWrite((tx) => tx.run(writeQuery, params));
  }

  async findPathBetweenPlayers(
    srcId: string,
    tgtId: string,
  ): Promise<{ nodes: any[]; segments: any[] }> {
    const cypher = `MATCH (source:Player {id: $a}), (target:Player {id: $b})
      MATCH p = shortestPath(
        (source)-[*..20]-(target)
      )
      WHERE NONE(n IN nodes(p) WHERE (n:RglTeam AND n.tag = "FA"))
      RETURN p, nodes(p) as nodes`;

    const res = await this.session.executeRead((tx) =>
      tx.run(cypher, { a: srcId, b: tgtId }),
    );

    if (!res.records || res.records.length === 0) {
      return { nodes: [], segments: [] };
    }

    const path = res.records[0].get("p");
    const nodes = res.records[0].get("nodes");

    // serialize nodes and segments similar to API handler
    const nodesOut = nodes.map(serializeNode);

    const segmentsRaw = path.segments ?? [];
    const segmentsOut = segmentsRaw.map((seg: any) => {
      const start = serializeNode(seg.start);
      const end = serializeNode(seg.end);
      return {
        start,
        end,
        type: seg.relationship ? seg.relationship.type : null,
      };
    });

    return { nodes: nodesOut, segments: segmentsOut };
  }
}
