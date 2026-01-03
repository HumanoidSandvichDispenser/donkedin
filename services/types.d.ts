export interface IService<TClient> {
  client: TClient;
}

/**
 * Contains a summary of team information, typically used in PlayerProfiles.
 */
export interface TeamSummary {
  id: number;
  name: string;
}

/**
 * Contains full information of a player for a particular league.
 */
export interface PlayerProfile {
  id: string;
  name: string;
  teams: TeamSummary[];
  avatarUrl?: string | null;
}

/**
 * Contains summary information about a player.
 */
export interface PlayerSummary {
  id: string;
  name: string;
}

/**
 * Contains full information of a team.
 */
export interface TeamProfile {
  id: number;
  tag: string;
  name: string;
  players: PlayerSummary[];
}
