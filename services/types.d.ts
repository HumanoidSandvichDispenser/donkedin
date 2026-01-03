export interface IService<TClient> {
    client: TClient;
}

/**
 * Contains a summary of team information, typically used in PlayerProfiles.
 */
export interface TeamSummary {
  teamId: number;
  teamName: string;
}

/**
 * Contains full information of a player.
 */
export interface PlayerProfile {
  steamId: string;
  name: string;
  teams: TeamSummary[];
  avatarUrl?: string | null;
}

/**
 * Contains summary information about a player and their participation in a
 * team, used in TeamProfiles.
 */
export interface PlayerSummary {
  steamId: string;
  name: string;
  competition?: string | null;
}

/**
 * Contains full information of a team.
 */
export interface TeamProfile {
  teamId: number;
  teamTag: string;
  teamName: string;
  players: PlayerSummary[];
}
