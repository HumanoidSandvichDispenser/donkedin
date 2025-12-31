import type { RglClient } from "~~/server/lib/rgl/RglClient";
import type { RglPlayer, RglPlayerTeam } from "~~/server/lib/rgl/types";
import type { Etf2lClient } from "~~/server/lib/etf2l/Etf2lClient";
import type {
  Etf2lPlayer,
  Etf2lPlayerTransferResponse,
  Etf2lPlayerTransfer,
  Etf2lTeam,
  Etf2lTeamTransferResponse,
  Etf2lTeamTransfer,
} from "~~/server/lib/etf2l/types";

export interface TeamSummary {
  teamId: number;
  teamName: string;
}

export interface PlayerProfile {
  steamId: string;
  name: string;
  teams: TeamSummary[];
  avatarUrl?: string | null;
}

export interface PlayerSummary {
  steamId: string;
  name: string;
  competition?: string | null;
}

export interface TeamProfile {
  teamId: number;
  teamTag: string;
  teamName: string;
  players: PlayerSummary[];
}

export async function fetchRglExternalData(
  client: RglClient,
  id: string,
): Promise<PlayerProfile | null> {
  let rglProfile: RglPlayer | null = null;
  let rglTeams: RglPlayerTeam[] = [];

  try {
    const profile = await client.profile.getV0Profile(id);
    rglProfile = profile as RglPlayer;
  } catch (e) {
    // profile failed; return defaults
    return null;
  }

  if (rglProfile) {
    try {
      const teams = await client.profile.getV0ProfileTeams(id);
      rglTeams = teams as RglPlayerTeam[];
    } catch (e) {
      // on failure keep teams empty
      rglTeams = [];
    }
  }

  const teams: TeamSummary[] = rglTeams
    .map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
    }));

  return {
    steamId: rglProfile.steamId,
    name: rglProfile.name,
    teams,
  }
}

export async function fetchEtf2lExternalData(
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

  const teams: TeamSummary[] = etf2lTransfers?.data
    .filter((t) => t.type === "joined")
    .map((t) => ({
      teamId: t.team.id,
      teamName: t.team.name,
    })) ?? [];

  return {
    steamId: etf2lPlayer.player.steam.id64,
    name: etf2lPlayer.player.name,
    teams,
  }
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
      const first = (await client.team.getTeamTransfers(Number(id), 1)) as Etf2lTeamTransferResponse;
      const collected: Etf2lTeamTransfer[] = Array.isArray(first.data) ? [...first.data] : [];
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

  const players: PlayerSummary[] = etf2lTransfers?.data
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
  }
}
