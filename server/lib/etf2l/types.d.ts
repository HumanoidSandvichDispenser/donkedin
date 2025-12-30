export interface Etf2lPlayer {
  player: {
    id: number;

    name: string;

    steam: {
      id64: string;
    };

    teams: Etf2lPlayerTeam[];
  };
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
  };
}

export interface Etf2lTeam {
  team: {
    id: number;

    name: string;

    tag: string;

    players: Etf2lTeamPlayer[];
  };
}

export interface Etf2lPlayerTransferResponse {
  data: Etf2lPlayerTransfer[];
  links: {
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
  };
}

export interface Etf2lPlayerTransfer {
  team: Etf2lPlayerTeam;
  time: number;
  type: "joined" | "left";
}

export interface Etf2lTeamTransferResponse {
  data: Etf2lTeamTransfer[];
  links: {
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
  };
}

export interface Etf2lTeamTransfer {
  time: number;
  type: "joined" | "left";
  who: Etf2lTeamPlayer;
  by: Etf2lTeamPlayer;
}
