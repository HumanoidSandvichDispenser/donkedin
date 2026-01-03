import type { RglClient } from "../clients/rgl/RglClient";
import type { RglPlayer, RglPlayerTeam, RglSeason, RglTeam } from "../clients/rgl/types";
import type { IService, PlayerProfile, PlayerSummary, TeamProfile, TeamSummary } from "./types";
import { Repository } from "../repositories/types";

export default class RglService implements IService<RglClient> {
  client: RglClient;
  repository: Repository;

  constructor(client: RglClient, repository: Repository) {
    this.client = client;
    this.repository = repository;
  }

  /**
   * Fetches an RGL player from RGL's public API.
   */
  async fetchRglPlayerFromApi(id: string): Promise<PlayerProfile | null> {
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
      id: t.teamId,
      name: t.teamName,
    }));

    return {
      id: rglProfile.steamId,
      name: rglProfile.name,
      teams,
    };
  };

  /**
   * Fetches an RGL team directly from RGL's public API.
   */
  async fetchRglTeamFromApi(id: number): Promise<TeamProfile | null> {
    try {
      const team = await this.client.teams.getV0Teams(id) as RglTeam;

      return {
        id: team.teamId,
        tag: team.tag,
        name: team.name,
        players: team.players.map((p) => ({
          id: p.steamId,
          name: p.name,
        })),
      };
    } catch (e) {
      // on failure return null
      return null;
    }
  };

  /**
   * Fetches an RGL season from the database or directly from RGL's public API
   * if it does not exist.
   */
  async fetchRglSeason(seasonId: number): Promise<RglSeason | null> {
    // read from database first
    let season = await this.repository.rglSeason.getSeason(seasonId);

    // fetch if not found in database
    if (!season) {
      const res = await this.client.seasons.getV0Seasons(seasonId);
      season = res as RglSeason;

      if (season) {
        // store in database
        this.repository.rglSeason.putSeason(seasonId, season);
      }
    }

    return season;
  }
}
