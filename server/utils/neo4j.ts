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
