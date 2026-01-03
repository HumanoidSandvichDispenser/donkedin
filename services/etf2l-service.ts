import type {
  Etf2lClient,
  Etf2lPlayer,
  Etf2lPlayerTransferResponse,
  Etf2lPlayerTransfer,
  Etf2lTeam,
  Etf2lTeamTransferResponse,
  Etf2lTeamTransfer,
} from "~~/clients/lib/etf2l/types";
import type {
  IService,
  PlayerProfile,
  PlayerSummary,
  TeamProfile,
  TeamSummary,
} from "./types";

export default class Etf2lService implements IService<Etf2lClient> {
  client: Etf2lClient;

  constructor(client: Etf2lClient) {
    this.client = client;
  }
}

export async function fetchEtf2lPlayer(
  client: Etf2lClient,
  id: string,
): Promise<PlayerProfile | null> {
  let etf2lPlayer: Etf2lPlayer | null = null;
  let etf2lTransfers: Etf2lPlayerTransferResponse | null = null;

  try {
    const profile = await client.player.getPlayer(id);
    etf2lPlayer = profile as Etf2lPlayer;
  } catch (e) {
    // profile failed; return defaults
    return null;
  }

  if (etf2lPlayer) {
    try {
      const first = (await client.player.getPlayerTransfers(
        id,
        1,
      )) as Etf2lPlayerTransferResponse;
      const collected: Etf2lPlayerTransfer[] = Array.isArray(first.data)
        ? [...first.data]
        : [];
      const current = first.meta?.current_page ?? 1;
      const lastPage = first.meta?.last_page ?? current;

      if (lastPage > current) {
        const pageCalls: Promise<Etf2lPlayerTransferResponse>[] = [];
        for (let p = current + 1; p <= lastPage; p++) {
          pageCalls.push(client.player.getPlayerTransfers(id, p));
        }

        const settled = await Promise.allSettled(pageCalls);
        for (const res of settled) {
          if (res.status === "fulfilled" && Array.isArray(res.value.data)) {
            collected.push(...res.value.data);
          }
        }
      }

      etf2lTransfers = {
        data: collected,
        links: { next: null },
        meta: { current_page: current, last_page: lastPage },
      } as Etf2lPlayerTransferResponse;
    } catch (e) {
      // keep null on failure
    }
  }

  const teams: TeamSummary[] =
    etf2lTransfers?.data
      .filter((t) => t.type === "joined")
      .map((t) => ({
        teamId: t.team.id,
        teamName: t.team.name,
      })) ?? [];

  return {
    steamId: etf2lPlayer.player.steam.id64,
    name: etf2lPlayer.player.name,
    teams,
  };
}

export async function fetchEtf2lTeam(
  client: Etf2lClient,
  id: string,
): Promise<TeamProfile | null> {
  let etf2lTeam: Etf2lTeam | null = null;
  let etf2lTransfers: Etf2lTeamTransferResponse | null = null;

  try {
    const profile = await client.team.getTeam(Number(id));
    etf2lTeam = profile as Etf2lTeam;
  } catch (e) {
    return null;
  }

  if (etf2lTeam) {
    try {
      const first = (await client.team.getTeamTransfers(
        Number(id),
        1,
      )) as Etf2lTeamTransferResponse;
      const collected: Etf2lTeamTransfer[] = Array.isArray(first.data)
        ? [...first.data]
        : [];
      const current = first.meta?.current_page ?? 1;
      const lastPage = first.meta?.last_page ?? current;

      if (lastPage > current) {
        const pageCalls: Promise<Etf2lTeamTransferResponse>[] = [];
        for (let p = current + 1; p <= lastPage; p++) {
          pageCalls.push(client.team.getTeamTransfers(Number(id), p));
        }

        const settled = await Promise.allSettled(pageCalls);
        for (const res of settled) {
          if (res.status === "fulfilled" && Array.isArray(res.value.data)) {
            collected.push(...res.value.data);
          }
        }
      }

      etf2lTransfers = {
        data: collected,
        links: { next: null },
        meta: { current_page: current, last_page: lastPage },
      } as Etf2lTeamTransferResponse;
    } catch (e) {
      // keep null on failure
    }
  }

  const players: PlayerSummary[] =
    etf2lTransfers?.data
      .filter((t) => t.type === "joined")
      .map((t) => ({
        steamId: t.who.steam.id64,
        name: t.who.name,
      })) ?? [];

  return {
    teamId: etf2lTeam.team.id,
    teamName: etf2lTeam.team.name,
    teamTag: etf2lTeam.team.tag,
    players,
  };
}
