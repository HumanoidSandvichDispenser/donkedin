import { getDriver } from "~~/server/utils/neo4j";
import neo4j from "neo4j-driver";

function parseIdentifier(input: string | undefined) {
  if (!input) return null;
  const s = String(input).trim();
  if (s.toLowerCase().startsWith("rgl:")) {
    return { prop: "rglName", value: s.slice(4) };
  }
  if (s.toLowerCase().startsWith("etf2l:")) {
    return { prop: "etf2lName", value: s.slice(6) };
  }
  // default to steamid64 stored in `id`
  return { prop: "id", value: s };
}

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

function serializeRelationship(rel: any) {
  return {
    id: neo4j.isInt(rel.identity) ? rel.identity.toNumber() : rel.identity,
    type: rel.type,
    start: neo4j.isInt(rel.start) ? rel.start.toNumber() : rel.start,
    end: neo4j.isInt(rel.end) ? rel.end.toNumber() : rel.end,
    properties: convertNeo4jValue(rel.properties ?? {}),
  };
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>;

  const rawA = q?.a;
  const rawB = q?.b;

  const a = parseIdentifier(rawA);
  const b = parseIdentifier(rawB);

  if (!a || !b) {
    return createError({
      statusCode: 400,
      statusMessage: "Missing source or target (a/b)",
    });
  }

  const driver = getDriver();
  const session = driver.session();

  try {
    // Build a safe query using only known property names
    const srcKey = a.prop;
    const tgtKey = b.prop;

    const cypher = `MATCH (source:Player {${srcKey}: $a}), (target:Player {${tgtKey}: $b})
      MATCH p = shortestPath(
        (source)-[*..20]-(target)
      )
      WHERE NONE(n IN nodes(p) WHERE (n:RglTeam AND n.tag = \"FA\"))
      RETURN p, nodes(p) as nodes`;

    const res = await session.executeRead((tx) =>
      tx.run(cypher, { a: a.value, b: b.value }),
    );

    if (!res.records || res.records.length === 0) {
      return { found: false, path: null };
    }

    const path = res.records[0].get("p");
    const nodes = res.records[0].get("nodes");

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

    return {
      found: true,
      nodes: nodesOut,
      segments: segmentsOut,
    };
  } catch (err) {
    console.error("Error in player path handler:", err);
    throw createError({ statusCode: 500, statusMessage: "Internal error" });
  } finally {
    await session.close();
  }
});
