import { Neo4jRepository } from "./repository";
import type { RglSeasonRepository } from "../types";
import { RglSeason } from "../../clients/rgl/types";

export default class Neo4jRglSeasonRepository
  extends Neo4jRepository
  implements RglSeasonRepository
{
  async getSeason(id: number): Promise<RglSeason | null> {
    const readRes = await this.session.executeRead((tx) =>
      tx.run("MATCH (s:RglSeason {id:$id}) RETURN s", { id }),
    );

    if (readRes.records.length > 0) {
      const sNode = readRes.records[0].get("s");
      const seasonOut: RglSeason = {
        name: sNode.properties.name ?? "",
        formatName: sNode.properties.formatName ?? "",
        regionName: sNode.properties.regionName ?? "",
        maps: Array.isArray(sNode.properties.maps) ? sNode.properties.maps : [],
      };

      return seasonOut;
    }

    return null;
  }

  async putSeason(id: number, season: RglSeason): Promise<void> {
    const q = `
    MERGE (s:RglSeason {id: $id})
    SET s.name = $name,
        s.formatName = $formatName,
        s.regionName = $regionName,
        s.maps = $maps,
        s.lastUpdated = datetime()
    RETURN s
    `;

    const params = {
      id,
      name: season.name ?? null,
      formatName: season.formatName ?? null,
      regionName: season.regionName ?? null,
      maps: Array.isArray(season.maps) ? season.maps : [],
    };

    await this.session.executeWrite((tx) => tx.run(q, params));
  }
}
