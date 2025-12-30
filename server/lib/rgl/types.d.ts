export interface RglPlayer {
  steamId: string;

  name: string;
}

/**
 * Interface representing a summary of a team within a player's RGL history.
 */
export interface RglPlayerTeam {
  formatName: string;

  seasonId: number;

  seasonName: string;

  divisionId: number;

  divisionName: string;

  leftAt: string | undefined;

  teamName: string;

  teamId: number;
}

/**
 * Interface representing a summary of a player within an RGL team.
 */
export interface RglTeamPlayer {
  name: string;

  steamId: string;
}

/**
 * Interface representing a team's information.
 */
export interface RglTeam {
  teamId: number;

  seasonId: number;

  tag: string;

  name: string;
}
