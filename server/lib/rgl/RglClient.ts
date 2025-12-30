/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from "./core/BaseHttpRequest";
import type { OpenAPIConfig } from "./core/OpenAPI";
import { FetchHttpRequest } from "./core/FetchHttpRequest";
import { BansService } from "./services/BansService";
import { MatchesService } from "./services/MatchesService";
import { ProfileService } from "./services/ProfileService";
import { SeasonsService } from "./services/SeasonsService";
import { TeamsService } from "./services/TeamsService";
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class RglClient {
  public readonly bans: BansService;
  public readonly matches: MatchesService;
  public readonly profile: ProfileService;
  public readonly seasons: SeasonsService;
  public readonly teams: TeamsService;
  public readonly request: BaseHttpRequest;
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? "",
      VERSION: config?.VERSION ?? "0.1.0",
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? "include",
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.bans = new BansService(this.request);
    this.matches = new MatchesService(this.request);
    this.profile = new ProfileService(this.request);
    this.seasons = new SeasonsService(this.request);
    this.teams = new TeamsService(this.request);
  }
}
