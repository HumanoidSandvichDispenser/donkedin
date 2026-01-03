import { describe, it, expect, vi, beforeEach } from "vitest";

// mock fetchAvatarUrl module before importing the service
vi.mock("../../server/utils/fetchAvatarUrl", () => ({
  fetchAvatarUrl: vi.fn(),
}));

import PlayerService from "../../services/player-service";
import { createStrictRepositoryMock } from "../utils/strictMock";
import { fetchAvatarUrl } from "../../server/utils/fetchAvatarUrl";

describe("player-service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches player data when needed", async () => {
    const repo = createStrictRepositoryMock();
    // allow upsert to be called
    repo.player.upsertPlayerProfile = vi.fn().mockResolvedValue(undefined);
    repo.player.needsFetch = vi.fn().mockResolvedValue(true);

    const rglProfile = { id: "rgl1" };
    const etf2lProfile = null;

    const rglService: any = {
      fetchRglPlayerFromApi: vi.fn().mockResolvedValue(rglProfile),
    };

    const etf2lService: any = {
      fetchEtf2lPlayerFromApi: vi.fn().mockResolvedValue(etf2lProfile),
    };

    (fetchAvatarUrl as any).mockResolvedValue("http://avatar/url");

    const svc = new PlayerService(rglService, etf2lService, repo as any);
    await svc.fetchPlayer("STEAM_1");

    expect(repo.player.needsFetch).toHaveBeenCalledWith("STEAM_1");
    expect(rglService.fetchRglPlayerFromApi).toHaveBeenCalledWith("STEAM_1");
    expect(etf2lService.fetchEtf2lPlayerFromApi).toHaveBeenCalledWith(
      "STEAM_1",
    );
    expect(repo.player.upsertPlayerProfile).toHaveBeenCalledWith(
      "STEAM_1",
      { rgl: rglProfile, etf2l: undefined },
      "http://avatar/url",
    );
  });

  it("does not fetch player data when not needed", async () => {
    const repo = createStrictRepositoryMock();
    repo.player.needsFetch = vi.fn().mockResolvedValue(false);

    const rglService: any = {
      fetchRglPlayerFromApi: vi.fn().mockResolvedValue({}),
    };
    const etf2lService: any = {
      fetchEtf2lPlayerFromApi: vi.fn().mockResolvedValue({}),
    };

    (fetchAvatarUrl as any).mockResolvedValue("http://avatar/url");

    const svc = new PlayerService(rglService, etf2lService, repo as any);
    await svc.fetchPlayer("STEAM_2");

    expect(repo.player.needsFetch).toHaveBeenCalledWith("STEAM_2");
    expect(rglService.fetchRglPlayerFromApi).not.toHaveBeenCalled();
    expect(etf2lService.fetchEtf2lPlayerFromApi).not.toHaveBeenCalled();
    expect(repo.player.upsertPlayerProfile).not.toHaveBeenCalled();
  });

  it("upserts fetched data into the repository", async () => {
    const repo = createStrictRepositoryMock();
    repo.player.upsertPlayerProfile = vi.fn().mockResolvedValue(undefined);
    repo.player.needsFetch = vi.fn().mockResolvedValue(true);

    const rglProfile = { id: "rglX" };
    const etf2lProfile = { id: "etfY" };

    const rglService: any = {
      fetchRglPlayerFromApi: vi.fn().mockResolvedValue(rglProfile),
    };
    const etf2lService: any = {
      fetchEtf2lPlayerFromApi: vi.fn().mockResolvedValue(etf2lProfile),
    };

    (fetchAvatarUrl as any).mockResolvedValue(null);

    const svc = new PlayerService(rglService, etf2lService, repo as any);
    await svc.fetchPlayer("STEAM_3");

    expect(repo.player.upsertPlayerProfile).toHaveBeenCalledWith(
      "STEAM_3",
      { rgl: rglProfile, etf2l: etf2lProfile },
      undefined,
    );
  });
});
