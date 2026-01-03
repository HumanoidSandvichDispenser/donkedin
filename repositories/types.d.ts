export interface Player {
  id: string;
}

export interface PlayerRepository {
  getPlayerById(id: string): Promise<Player | null>;

  getPlayersByIds(ids: string[]): Promise<Player[]>;

  searchPlayersByAlias(alias: string, limit?: number): Promise<Player[]>;

  upsertPlayer(player: Player): Promise<void>;
}

export interface Team {
  id: number;
  name: string;
  tag?: string;
  seasonName?: string;
  divisionName?: string;
}

interface LeagueTeamRepository<TTeam extends Team> {
  getTeamById(id: string): Promise<TTeam | null>;

  getTeamsByIds(ids: string[]): Promise<TTeam[]>;

  upsertTeam(team: TTeam): Promise<void>;
}

export interface TeamRepository {
  rgl: LeagueTeamRepository<Team>;
  etf2l: LeagueTeamRepository<Team>;
}

export interface Repository {
  player: PlayerRepository;
  team: TeamRepository;
}
