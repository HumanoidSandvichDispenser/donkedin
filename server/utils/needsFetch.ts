import neo4j from "neo4j-driver";

/**
 * Checks whether a node of given label and id needs fetching.
 * Returns a boolean: true if the node does not exist, has no lastUpdated,
 * or lastUpdated is older than `days` days.
 *
 * @param label   e.g. 'Player' or 'RglTeam' or 'Etf2lTeam'
 * @param idProp  property name used as identifier on the node (defaults to 'id')
 */
export async function needsFetch(
  session: neo4j.Session,
  label: string,
  id: string | number,
  days = 3,
  idProp = "id",
): Promise<boolean> {
  // validate label and idProp to avoid injection; allow only A-Z,a-z,0-9,_
  if (!/^[A-Za-z0-9_]+$/.test(label)) {
    throw new Error("Invalid label");
  }
  if (!/^[A-Za-z0-9_]+$/.test(idProp)) {
    throw new Error("Invalid idProp");
  }

  // Use parameterized Cypher and compute condition with duration
  const q = `OPTIONAL MATCH (n:${label} {${idProp}: $id})
RETURN CASE
  WHEN n IS NULL THEN true
  WHEN n.lastUpdated IS NULL THEN true
  WHEN n.lastUpdated < datetime() - duration({days:$days}) THEN true
  ELSE false
END AS needsFetch`;

  const res = await session.executeRead((tx) => tx.run(q, { id, days }));

  if (!res.records || res.records.length === 0) return true;

  const val = res.records[0].get("needsFetch");
  // The driver may return neo4j.Boolean or JS boolean
  return val === true || val === "true" || String(val) === "true";
}
