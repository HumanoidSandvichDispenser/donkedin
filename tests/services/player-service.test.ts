import { describe, it, expect, vi, beforeEach } from "vitest";

import PlayerService from "../../services/player-service";
import { createStrictRepositoryMock } from "../utils/strictMock";
import { fetchAvatarUrl } from "../../server/utils/fetchAvatarUrl";

// mock fetchAvatarUrl module before importing the service
vi.mock("../../server/utils/fetchAvatarUrl", () => ({
  fetchAvatarUrl: vi.fn(),
}));

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
    await svc.fetchPlayer("76561198248436608");

    expect(repo.player.needsFetch).toHaveBeenCalledWith("76561198248436608");
    expect(rglService.fetchRglPlayerFromApi).toHaveBeenCalledWith(
      "76561198248436608",
    );
    expect(etf2lService.fetchEtf2lPlayerFromApi).toHaveBeenCalledWith(
      "76561198248436608",
    );
    expect(repo.player.upsertPlayerProfile).toHaveBeenCalledWith(
      "76561198248436608",
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
    await svc.fetchPlayer("76561198248436608");

    expect(repo.player.needsFetch).toHaveBeenCalledWith("76561198248436608");
    expect(rglService.fetchRglPlayerFromApi).not.toHaveBeenCalled();
    expect(etf2lService.fetchEtf2lPlayerFromApi).not.toHaveBeenCalled();
    expect(repo.player.upsertPlayerProfile).not.toHaveBeenCalled();
  });

  it("upserts fetched data into the repository", async () => {
    const repo = createStrictRepositoryMock();
    repo.player.upsertPlayerProfile = vi.fn().mockResolvedValue(undefined);
    repo.player.needsFetch = vi.fn().mockResolvedValue(true);

    const rglProfile = { id: "76561198248436608" };
    const etf2lProfile = { id: "76561198248436608" };

    const rglService: any = {
      fetchRglPlayerFromApi: vi.fn().mockResolvedValue(rglProfile),
    };
    const etf2lService: any = {
      fetchEtf2lPlayerFromApi: vi.fn().mockResolvedValue(etf2lProfile),
    };

    (fetchAvatarUrl as any).mockResolvedValue(null);

    const svc = new PlayerService(rglService, etf2lService, repo as any);
    await svc.fetchPlayer("76561198248436608");

    expect(repo.player.upsertPlayerProfile).toHaveBeenCalledWith(
      "76561198248436608",
      { rgl: rglProfile, etf2l: etf2lProfile },
      undefined,
    );
  });
});

it("returns player details via repository", async () => {
  const repo = createStrictRepositoryMock();
  const expected = {
    player: {
      id: "7656",
      rglName: "a",
      etf2lName: null,
      lastUpdated: null,
      avatarUrl: null,
    },
    teams: { rgl: [{ id: 1, name: "T1" }], etf2l: [] },
    teammates: [
      {
        id: "7657",
        rglName: "Mate",
        etf2lName: null,
        lastUpdated: null,
        avatarUrl: null,
      },
    ],
    pageCount: 1,
  };
  repo.player.getPlayerDetailsById = vi.fn().mockResolvedValue(expected);
  repo.player.needsFetch = vi.fn().mockResolvedValue(false);

  const rglService: any = { fetchRglPlayerFromApi: vi.fn() };
  const etf2lService: any = { fetchEtf2lPlayerFromApi: vi.fn() };

  const svc = new PlayerService(rglService, etf2lService, repo as any);
  const res1 = await svc.getPlayerDetails("7656");

  expect(repo.player.getPlayerDetailsById).toHaveBeenCalledWith("7656", 0, 25);
  expect(res1).toBe(expected);

  // also test pagination and limit value is passed through
  repo.player.getPlayerDetailsById = vi.fn().mockResolvedValue(expected);
  const res2 = await svc.getPlayerDetails("7656", 2, 50);
  expect(repo.player.getPlayerDetailsById).toHaveBeenCalledWith("7656", 2, 50);
  expect(res2).toBe(expected);
});
