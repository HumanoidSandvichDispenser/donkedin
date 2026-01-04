import type { Session } from "neo4j-driver";
import Neo4jPlayerRepository from "./player-repository";
import {
  Neo4jEtf2lTeamRepository,
  Neo4jRglTeamRepository,
} from "./team-repository";
import type { Repository } from "../types";

export default function createRepository(session: Session): Repository {
  return {
    player: new Neo4jPlayerRepository(session),
    team: {
      rgl: new Neo4jRglTeamRepository(session),
      etf2l: new Neo4jEtf2lTeamRepository(session),
    },
  };
}
