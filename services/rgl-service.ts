import type { RglClient } from "~~/server/lib/rgl/RglClient";
import type { RglPlayer, RglPlayerTeam, RglSeason } from "~~/server/lib/rgl/types";
import type { IService, PlayerProfile, PlayerSummary, TeamProfile, TeamSummary } from "./types";
import { needsFetch } from "../server/utils/needsFetch";
import { Repository } from "../repositories/types";

export default class RglService implements IService<RglClient> {
  client: RglClient;
  repository: Repository;

  constructor(client: RglClient, repository: Repository) {
    this.client = client;
    this.repository = repository;
  }

  async fetchRglPlayer(id: string): Promise<PlayerProfile | null> {
    let rglProfile: RglPlayer | null = null;
    let rglTeams: RglPlayerTeam[] = [];

    try {
      const profile = await this.client.profile.getV0Profile(id);
      rglProfile = profile as RglPlayer;
    } catch (e) {
      // profile failed; return defaults
      return null;
    }

    if (rglProfile) {
      try {
        const teams = await this.client.profile.getV0ProfileTeams(id);
        rglTeams = teams as RglPlayerTeam[];
      } catch (e) {
        // on failure keep teams empty
        rglTeams = [];
      }
    }

    const teams: TeamSummary[] = rglTeams.map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
    }));

    return {
      steamId: rglProfile.steamId,
      name: rglProfile.name,
      teams,
    };
  };

  /**
   * Fetches an RGL team from the database or directly from RGL's public API
   * if it does not exist or is stale.
   */
  async fetchRglTeam(id: Number): Promise<TeamProfile | null> {
    const shouldFetch = await this.repository.team.rgl.needsFetch(id);
    if (shouldFetch) {
      const rglTeam = await this.client.teams.getV0Teams(id.toString());
      if (rglTeam) {

      }
    }
  };

  async fetchRglSeason(seasonId: number): Promise<RglSeason | null> => {

  }
}
