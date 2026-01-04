import neo4j from "neo4j-driver";

let driver: neo4j.Driver | undefined;

export function getDriver(): neo4j.Driver {
  if (driver) {
    return driver;
  }

  const uri =
    process.env.NEO4J_URI ||
    process.env.NEO4J_BOLT_URL ||
    "bolt://localhost:7687";
  const user = process.env.NEO4J_USER || process.env.NEO4J_USERNAME || "neo4j";
  const pass = process.env.NEO4J_PASS || process.env.NEO4J_PASSWORD || "neo4j";

  driver = neo4j.driver(uri, neo4j.auth.basic(user, pass));

  return driver;
}

export function convertNeo4jValue(v: any): any {
  if (neo4j.isInt(v)) {
    return v.toNumber();
  }

  if (Array.isArray(v)) {
    return v.map(convertNeo4jValue);
  }

  if (v && typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v)) {
      out[k] = convertNeo4jValue(v[k]);
    }
    return out;
  }
  return v;
}

export function serializeNode(node: any) {
  return {
    id: neo4j.isInt(node.identity) ? node.identity.toNumber() : node.identity,
    labels: node.labels,
    properties: convertNeo4jValue(node.properties ?? {}),
  };
}

export function serializeRelationship(rel: any) {
  return {
    id: neo4j.isInt(rel.identity) ? rel.identity.toNumber() : rel.identity,
    type: rel.type,
    start: neo4j.isInt(rel.start) ? rel.start.toNumber() : rel.start,
    end: neo4j.isInt(rel.end) ? rel.end.toNumber() : rel.end,
    properties: convertNeo4jValue(rel.properties ?? {}),
  };
}
