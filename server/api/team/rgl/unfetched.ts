import { getDriver } from "~~/server/utils/neo4j";
import neo4j from "neo4j-driver";

function convertNeo4jValue(v: any): any {
  if (neo4j.isInt && neo4j.isInt(v)) return v.toNumber();
  if (Array.isArray(v)) return v.map(convertNeo4jValue);
  if (v && typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v)) {
      out[k] = convertNeo4jValue(v[k]);
    }
    return out;
  }
  return v;
}

function serializeNode(node: any) {
  return {
    id: neo4j.isInt(node.identity) ? node.identity.toNumber() : node.identity,
    labels: node.labels,
    properties: convertNeo4jValue(node.properties ?? {}),
  };
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>;
  let count = 1;

  if (q?.count !== undefined) {
    const parsed = parseInt(String(q.count), 10);
    if (isNaN(parsed) || parsed < 1) {
      return createError({ statusCode: 400, statusMessage: "Invalid count" });
    }
    count = parsed;
  }

  // cap to 1000
  count = Math.min(count, 1000);

  const driver = getDriver();
  const session = driver.session();

  try {
    const cypher = `MATCH (n:RglTeam) WHERE n.lastUpdated IS NULL RETURN n LIMIT $limit`;
    const res = await session.executeRead((tx) =>
      tx.run(cypher, { limit: neo4j.int(count) }),
    );

    const out: any[] = [];
    for (const rec of res.records) {
      const node = rec.get("n");
      out.push(serializeNode(node));
    }

    return { count: out.length, teams: out };
  } catch (err) {
    console.error("Error in player unfetched handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
