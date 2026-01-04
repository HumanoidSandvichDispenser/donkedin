import type { RglSeason } from "../clients/rgl/types";
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
  };
}

export interface PlayerRepository {
  needsFetch(id: string): Promise<boolean>;

  getPlayerWithTeamsById(id: string): Promise<PlayerWithTeams | null>;

  /**
   * Returns a detailed player summary including the player node, teams and
   * first-degree teammates (players who shared a team with this player).
   */
  getPlayerDetailsById(
    id: string,
    page?: number | undefined,
  ): Promise<{
    player: PlayerNode;
    teams: { rgl: TeamSummary[]; etf2l: TeamSummary[] };
    teammates: PlayerNode[];
    pageCount: number;
  } | null>;

  searchPlayersByAlias(alias: string, limit?: number): Promise<PlayerNode[]>;

  findPathBetweenPlayers(
    srcId: string,
    tgtId: string,
  ): Promise<{ nodes: any[]; segments: any[] }>;

  upsertPlayerProfile(
    id: string,
    profiles: {
      rgl?: PlayerProfile;
      etf2l?: PlayerProfile;
    },
    avatarUrl?: string,
  ): Promise<void>;
}

export interface TeamNode {
  id: string;
  name: string;
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
  needsFetch(id: number): Promise<boolean>;

  getTeamWithPlayersById(id: number): Promise<TeamWithPlayers | null>;

  upsertTeamProfile(team: TeamProfile): Promise<void>;
}

export interface TeamRepository {
  rgl: LeagueTeamRepository;
  etf2l: LeagueTeamRepository;
}

export interface RglSeasonRepository {
  getSeason(id: number): Promise<RglSeason | null>;

  putSeason(id: number, season: RglSeason): Promise<void>;
}

export interface Repository {
  player: PlayerRepository;
  team: TeamRepository;
  rglSeason: RglSeasonRepository;
}
