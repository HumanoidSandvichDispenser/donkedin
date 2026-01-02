import type { RglClient } from "../lib/rgl/RglClient";
import { getDriver } from "./neo4j";
import neo4j from "neo4j-driver";
import type { RglSeason } from "../lib/rgl/types";

export async function fetchRglSeason(
  client: RglClient,
  seasonId: number,
): Promise<RglSeason | null> {
  const driver = getDriver();
  const session = driver.session();

  try {
    // read from database first
    const readRes = await session.executeRead((tx) =>
      tx.run("MATCH (s:RglSeason {id:$id}) RETURN s", { id: seasonId }),
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

    // fetch if not found in database
    let season: RglSeason | null = null;
    try {
      const res = await client.seasons.getV0Seasons(seasonId);
      season = res as RglSeason;
    } catch (e) {
      return null;
    }

    if (season) {
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
        id: seasonId,
        name: season.name ?? null,
        formatName: season.formatName ?? null,
        regionName: season.regionName ?? null,
        maps: Array.isArray(season.maps) ? season.maps : [],
      };

      await session.executeWrite((tx) => tx.run(q, params));
    }

    return season;
  } finally {
    await session.close();
  }
}
