import { Repository } from "../repositories/types";
import Etf2lService from "./etf2l-service";
import RglService from "./rgl-service";
import { fetchAvatarUrl } from "../server/utils/fetchAvatarUrl";

export default class CommonLeagueService {
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

  async fetchPlayer(id: string) {
    const shouldFetch = await this.repository.player.needsFetch(id);

    if (shouldFetch) {
      const [rglProfile, etf2lProfile, avatarUrl] = await Promise.allSettled([
        this.rglService.fetchRglPlayerFromApi(id),
        this.rglService.fetchRglPlayerFromApi(id), // replace with etf2lService
        fetchAvatarUrl(id),
      ]);

      const rgl =
        rglProfile.status == "fulfilled" ? rglProfile.value : undefined;
      const etf2l =
        etf2lProfile.status == "fulfilled" ? etf2lProfile.value : undefined;
      const avatarUrlVal =
        avatarUrl.status == "fulfilled" ? avatarUrl.value : undefined;
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
}
