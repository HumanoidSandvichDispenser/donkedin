import { vi } from "vitest";
import type { Repository } from "../../repositories/types";

const rejecter = (name: string) =>
  vi.fn(() => Promise.reject(new Error(`Unexpected call to ${name}`)));

export function createStrictRepositoryMock(): Repository {
  return {
    player: {
      needsFetch: vi.fn().mockResolvedValue(true),
      getPlayerWithTeamsById: rejecter("player.getPlayerWithTeamsById"),
      getPlayerDetailsById: rejecter("player.getPlayerDetailsById"),
      searchPlayersByAlias: rejecter("player.searchPlayersByAlias"),
      findPathBetweenPlayers: rejecter("player.findPathBetweenPlayers"),
      upsertPlayerProfile: rejecter("player.upsertPlayerProfile"),
    },

    team: {
      rgl: {
        needsFetch: rejecter("team.rgl.needsFetch"),
        getTeamWithPlayersById: rejecter("team.rgl.getTeamWithPlayersById"),
        upsertTeamProfile: rejecter("team.rgl.upsertTeamProfile"),
      },
      etf2l: {
        needsFetch: rejecter("team.etf2l.needsFetch"),
        getTeamWithPlayersById: rejecter("team.etf2l.getTeamWithPlayersById"),
        upsertTeamProfile: rejecter("team.etf2l.upsertTeamProfile"),
      },
    },

    rglSeason: {
      getSeason: rejecter("rglSeason.getSeason"),
      putSeason: rejecter("rglSeason.putSeason"),
    },
  };
}
