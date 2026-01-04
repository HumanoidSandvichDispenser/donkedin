import type { Etf2lClient } from "~~/clients/etf2l/Etf2lClient";
import type {
  Etf2lPlayer,
  Etf2lPlayerTransferResponse,
  Etf2lPlayerTransfer,
  Etf2lTeam,
  Etf2lTeamTransferResponse,
  Etf2lTeamTransfer,
} from "~~/clients/etf2l/types";
import type {
  IService,
  PlayerProfile,
  PlayerSummary,
  TeamProfile,
  TeamSummary,
} from "./types";
import type { Repository } from "~~/repositories/types";

export default class Etf2lService implements IService<Etf2lClient> {
  client: Etf2lClient;
  repository: Repository;

  constructor(client: Etf2lClient, repository: Repository) {
    this.client = client;
    this.repository = repository;
  }

  async fetchEtf2lPlayerFromApi(id: string): Promise<PlayerProfile | null> {
    let etf2lPlayer: Etf2lPlayer | null = null;
    let etf2lTransfers: Etf2lPlayerTransferResponse | null = null;

    try {
      const profile = await this.client.player.getPlayer(id);
      etf2lPlayer = profile as Etf2lPlayer;
    } catch {
      return null;
    }

    if (etf2lPlayer) {
      try {
        const first = (await this.client.player.getPlayerTransfers(
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
            pageCalls.push(this.client.player.getPlayerTransfers(id, p));
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
      } catch {
        // keep null on failure
      }
    }

    const teams: TeamSummary[] =
      etf2lTransfers?.data
        .filter((t) => t.type === "joined")
        .map((t) => ({ id: t.team.id, name: t.team.name })) ?? [];

    return {
      id: etf2lPlayer.player.steam.id64,
      name: etf2lPlayer.player.name,
      teams,
    };
  }

  async fetchEtf2lTeamFromApi(id: string): Promise<TeamProfile | null> {
    let etf2lTeam: Etf2lTeam | null = null;
    let etf2lTransfers: Etf2lTeamTransferResponse | null = null;

    try {
      const profile = await this.client.team.getTeam(Number(id));
      etf2lTeam = profile as Etf2lTeam;
    } catch {
      return null;
    }

    if (etf2lTeam) {
      try {
        const first = (await this.client.team.getTeamTransfers(
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
            pageCalls.push(this.client.team.getTeamTransfers(Number(id), p));
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
      } catch {
        // keep null on failure
      }
    }

    const players: PlayerSummary[] =
      etf2lTransfers?.data
        .filter((t) => t.type === "joined")
        .map((t) => ({ id: t.who.steam.id64, name: t.who.name })) ?? [];

    return {
      id: etf2lTeam.team.id,
      tag: etf2lTeam.team.tag,
      name: etf2lTeam.team.name,
      players,
    };
  }

  async getTeam(id: number) {
    const shouldFetch = await this.repository.team.etf2l.needsFetch(id);
    if (shouldFetch) {
      const profile = await this.fetchEtf2lTeamFromApi(String(id));
      if (profile) {
        await this.repository.team.etf2l.upsertTeamProfile(profile as any);
      }
    }

    return this.repository.team.etf2l.getTeamWithPlayersById(id);
  }
}
