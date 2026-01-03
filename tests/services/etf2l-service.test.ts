import { describe, it, expect, vi } from "vitest";
import {
    fetchEtf2lPlayer,
} from "~~/services/etf2lService";

describe("fetchEtf2lPlayer", () => {
  it("returns null when profile call fails", async () => {
    const client: any = {
      player: {
        getPlayer: vi.fn(() => Promise.reject(new Error("not found"))),
        getPlayerTransfers: vi.fn(),
      },
    };

    const res = await fetchEtf2lPlayer(client, "42");
    expect(res).toBeNull();
    expect(client.player.getPlayer).toHaveBeenCalledWith("42");
    expect(client.player.getPlayerTransfers).not.toHaveBeenCalled();
  });

  it("concatenates teams from multiple pages of transfers", async () => {
    // prepare fake transfers across three pages
    const page1 = {
      data: [
        { team: { id: 10, name: "Team A" }, type: "joined" },
        { team: { id: 11, name: "Team B" }, type: "left" },
      ],
      meta: { current_page: 1, last_page: 3 },
      links: { next: "?page=2" },
    };

    const page2 = {
      data: [{ team: { id: 12, name: "Team C" }, type: "joined" }],
      meta: { current_page: 2, last_page: 3 },
      links: { next: "?page=3" },
    };

    const page3 = {
      data: [
        { team: { id: 13, name: "Team D" }, type: "joined" },
        { team: { id: 10, name: "Team A" }, type: "joined" },
      ],
      meta: { current_page: 3, last_page: 3 },
      links: { next: null },
    };

    const client: any = {
      player: {
        getPlayer: vi.fn(() =>
          Promise.resolve({
            player: { steam: { id64: "STEAM64" }, name: "EtfPlayer" },
          }),
        ),
        getPlayerTransfers: vi.fn((id: string, page = 1) => {
          if (page === 1) return Promise.resolve(page1);
          if (page === 2) return Promise.resolve(page2);
          if (page === 3) return Promise.resolve(page3);
          return Promise.resolve({
            data: [],
            meta: { current_page: page, last_page: page },
            links: { next: null },
          });
        }),
      },
    };

    const res = await fetchEtf2lPlayer(client, "777");
    expect(res).not.toBeNull();
    expect(res?.steamId).toBe("STEAM64");
    expect(res?.name).toBe("EtfPlayer");

    // teams should include only 'joined' entries from all pages in order
    expect(res?.teams).toEqual([
      { teamId: 10, teamName: "Team A" },
      { teamId: 12, teamName: "Team C" },
      { teamId: 13, teamName: "Team D" },
      { teamId: 10, teamName: "Team A" },
    ]);

    // ensure getPlayerTransfers was called for pages 1..3
    expect(client.player.getPlayerTransfers).toHaveBeenCalledWith("777", 1);
    expect(client.player.getPlayerTransfers).toHaveBeenCalledWith("777", 2);
    expect(client.player.getPlayerTransfers).toHaveBeenCalledWith("777", 3);
  });

  it("handles some page fetches failing and still returns concatenated successful pages", async () => {
    const page1 = {
      data: [{ team: { id: 20, name: "X" }, type: "joined" }],
      meta: { current_page: 1, last_page: 3 },
      links: { next: "?page=2" },
    };

    const client: any = {
      player: {
        getPlayer: vi.fn(() =>
          Promise.resolve({ player: { steam: { id64: "S" }, name: "P" } }),
        ),
        getPlayerTransfers: vi.fn((id: string, page = 1) => {
          if (page === 1) return Promise.resolve(page1);
          if (page === 2) return Promise.reject(new Error("network"));
          if (page === 3)
            return Promise.resolve({
              data: [{ team: { id: 21, name: "Y" }, type: "joined" }],
              meta: { current_page: 3, last_page: 3 },
              links: { next: null },
            });
          return Promise.resolve({
            data: [],
            meta: { current_page: page, last_page: page },
            links: { next: null },
          });
        }),
      },
    };

    const res = await fetchEtf2lPlayer(client, "88");
    expect(res).not.toBeNull();
    expect(res?.teams).toEqual([
      { teamId: 20, teamName: "X" },
      { teamId: 21, teamName: "Y" },
    ]);
  });
});

describe("fetchEtf2lTeam", () => {
  it("returns null when team profile call fails", async () => {
    const client: any = {
      team: {
        getTeam: vi.fn(() => Promise.reject(new Error("not found"))),
        getTeamTransfers: vi.fn(),
      },
    };

    const res = await fetchEtf2lTeam(client, "123");
    expect(res).toBeNull();
    expect(client.team.getTeam).toHaveBeenCalledWith(123);
    expect(client.team.getTeamTransfers).not.toHaveBeenCalled();
  });

  it("concatenates players from multiple pages of team transfers", async () => {
    const page1 = {
      data: [
        { who: { id: 1, name: "P1", steam: { id64: "S1" } }, type: "joined" },
        { who: { id: 2, name: "P2", steam: { id64: "S2" } }, type: "left" },
      ],
      meta: { current_page: 1, last_page: 2 },
      links: { next: "?page=2" },
    };

    const page2 = {
      data: [
        { who: { id: 3, name: "P3", steam: { id64: "S3" } }, type: "joined" },
      ],
      meta: { current_page: 2, last_page: 2 },
      links: { next: null },
    };

    const client: any = {
      team: {
        getTeam: vi.fn(() =>
          Promise.resolve({ team: { id: 50, name: "T50" } }),
        ),
        getTeamTransfers: vi.fn((id: number, page = 1) => {
          if (page === 1) return Promise.resolve(page1);
          if (page === 2) return Promise.resolve(page2);
          return Promise.resolve({
            data: [],
            meta: { current_page: page, last_page: page },
            links: { next: null },
          });
        }),
      },
    };

    const res = await fetchEtf2lTeam(client, "50");
    expect(res).not.toBeNull();
    expect(res?.teamId).toBe(50);
    expect(res?.teamName).toBe("T50");
    expect(res?.players).toEqual([
      { steamId: "S1", name: "P1" },
      { steamId: "S3", name: "P3" },
    ]);

    expect(client.team.getTeamTransfers).toHaveBeenCalledWith(50, 1);
    expect(client.team.getTeamTransfers).toHaveBeenCalledWith(50, 2);
  });

  it("handles partial page failures and still returns concatenated players", async () => {
    const page1 = {
      data: [
        { who: { id: 9, name: "X", steam: { id64: "SX" } }, type: "joined" },
      ],
      meta: { current_page: 1, last_page: 3 },
      links: { next: "?page=2" },
    };

    const client: any = {
      team: {
        getTeam: vi.fn(() =>
          Promise.resolve({ team: { id: 60, name: "T60" } }),
        ),
        getTeamTransfers: vi.fn((id: number, page = 1) => {
          if (page === 1) return Promise.resolve(page1);
          if (page === 2) return Promise.reject(new Error("network"));
          if (page === 3)
            return Promise.resolve({
              data: [
                {
                  who: { id: 10, name: "Y", steam: { id64: "SY" } },
                  type: "joined",
                },
              ],
              meta: { current_page: 3, last_page: 3 },
              links: { next: null },
            });
          return Promise.resolve({
            data: [],
            meta: { current_page: page, last_page: page },
            links: { next: null },
          });
        }),
      },
    };

    const res = await fetchEtf2lTeam(client, "60");
    expect(res).not.toBeNull();
    expect(res?.players).toEqual([
      { steamId: "SX", name: "X" },
      { steamId: "SY", name: "Y" },
    ]);
  });
});
