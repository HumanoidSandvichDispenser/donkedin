import type { Repository } from "../repositories/types";
import type Etf2lService from "./etf2l-service";
import type RglService from "./rgl-service";
import { fetchAvatarUrl } from "../server/utils/fetchAvatarUrl";

export default class PlayerService {
  rglService: RglService;
  etf2lService: Etf2lService;
  repository: Repository;

  constructor(
    rglService: RglService,
    etf2lService: Etf2lService,
    repository: Repository,
  ) {
    this.rglService = rglService;
    this.etf2lService = etf2lService;
    this.repository = repository;
  }

  /**
   * Fetches player data from external services if needed and updates the
   * repository.
   *
   * @param id - The 64-bit Steam ID of the player to fetch.
   * @returns A promise that resolves when the operation is complete.
   */
  async fetchPlayer(id: string) {
    const shouldFetch = await this.repository.player.needsFetch(id);

    if (!shouldFetch) {
      return;
    }

    // check if steam id (starts with 7656, 17 digits)
    if (!/^7656\d{13}$/.test(id)) {
      throw new Error("Invalid Steam ID");
    }

    const [rglProfile, etf2lProfile, avatarUrl] = await Promise.allSettled([
      this.rglService.fetchRglPlayerFromApi(id),
      this.etf2lService.fetchEtf2lPlayerFromApi(id),
      fetchAvatarUrl(id),
    ]);

    const rgl =
      rglProfile.status === "fulfilled" ? rglProfile.value : undefined;
    const etf2l =
      etf2lProfile.status === "fulfilled" ? etf2lProfile.value : undefined;
    const avatarUrlVal =
      avatarUrl.status === "fulfilled" ? avatarUrl.value : undefined;

    if (rgl || etf2l) {
      // upsert fetched data
      await this.repository.player.upsertPlayerProfile(
        id,
        {
          rgl: rgl ?? undefined,
          etf2l: etf2l ?? undefined,
        },
        avatarUrlVal ?? undefined,
      );
    }
  }

  /**
   * Returns a detailed player summary including player, teams and teammates.
   */
  async getPlayerDetails(id: string, page?: number, limit?: number) {
    await this.fetchPlayer(id);
    const pageNum = typeof page === "number" && page >= 0 ? page : 0;
    const limitNum = typeof limit === "number" && limit > 0 ? limit : 25;
    return this.repository.player.getPlayerDetailsById(id, pageNum, limitNum);
  }
}
