export interface Etf2lPlayer {
  player: {
    id: number;

    name: string;

    steam: {
      id64: string;
    }

    teams: Etf2lPlayerTeam[];
  }
}

export interface Etf2lPlayerTeam {
  id: number;

  name: string;
}

export interface Etf2lTeamPlayer {
  /**
   * ID in ETF2L
   */
  id: number;

  name: string;

  steam: {
    id64: string;
  }
}

export interface Etf2lTeam {
  id: number;

  name: string;

  tag: string;

  players: Etf2lTeamPlayer[];
}
