import type {
  PlayerProfile,
  PlayerSummary,
  TeamProfile,
  TeamSummary,
} from "../services/types";


export interface PlayerNode {
  id: string;
  lastUpdated: string;
  rglName?: string;
  etf2lName?: string;
  avatarUrl?: string;
}

export interface PlayerWithTeams {
  player: PlayerNode;
  teams: {
    rgl: TeamSummary[];
    etf2l: TeamSummary[];
  }
}

export interface PlayerRepository {
  needsFetch(id: string): Promise<boolean>;

  getPlayerWithTeamsById(id: string): Promise<PlayerWithTeams | null>;

  searchPlayersByAlias(alias: string, limit?: number): Promise<PlayerNode[]>;

  upsertPlayerProfile(id: string,
    profiles: {
      rgl?: PlayerProfile;
      etf2l?: PlayerProfile;
    },
    avatarUrl?: string): Promise<void>;
}

export interface TeamNode {
  id: string;
  lastUpdated: string;
  tag?: string;
  divisionName?: string;
  seasonName?: string;
}

export interface TeamWithPlayers {
  team: TeamNode;
  players: PlayerSummary[];
}

export interface LeagueTeamRepository {
  needsFetch(id: Number): Promise<boolean>;

  getTeamWithPlayersById(id: Number): Promise<TeamWithPlayers | null>;

  upsertTeamProfile(team: TeamProfile): Promise<void>;
}

export interface TeamRepository {
  rgl: LeagueTeamRepository;
  etf2l: LeagueTeamRepository;
}

export interface Repository {
  player: PlayerRepository;
  team: TeamRepository;
}
