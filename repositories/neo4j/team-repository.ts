import type { LeagueTeamRepository, TeamWithPlayers } from "../types";
import type { TeamProfile } from "../../services/types";
import { Neo4jRepository } from "./repository";

abstract class Neo4jTeamRepository
  extends Neo4jRepository
  implements LeagueTeamRepository
{
  abstract needsFetch(id: number): Promise<boolean>;

  abstract getTeamWithPlayersById(id: number): Promise<TeamWithPlayers | null>;

  abstract upsertTeamProfile(team: TeamProfile): Promise<void>;
}

export class Neo4jRglTeamRepository extends Neo4jTeamRepository {
  constructor(session: any) {
    super(session);
  }
}

export class Neo4jEtf2lTeamRepository extends Neo4jTeamRepository {
  constructor(session: any) {
    super(session);
  }
}
