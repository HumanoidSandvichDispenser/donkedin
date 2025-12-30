/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { BansService } from './services/BansService';
import { CompetitionService } from './services/CompetitionService';
import { DemosService } from './services/DemosService';
import { MatchesService } from './services/MatchesService';
import { PlayerService } from './services/PlayerService';
import { RecruitmentService } from './services/RecruitmentService';
import { TeamService } from './services/TeamService';
import { WhitelistsService } from './services/WhitelistsService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class Etf2lClient {
    public readonly bans: BansService;
    public readonly competition: CompetitionService;
    public readonly demos: DemosService;
    public readonly matches: MatchesService;
    public readonly player: PlayerService;
    public readonly recruitment: RecruitmentService;
    public readonly team: TeamService;
    public readonly whitelists: WhitelistsService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://api-v2.etf2l.org',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.bans = new BansService(this.request);
        this.competition = new CompetitionService(this.request);
        this.demos = new DemosService(this.request);
        this.matches = new MatchesService(this.request);
        this.player = new PlayerService(this.request);
        this.recruitment = new RecruitmentService(this.request);
        this.team = new TeamService(this.request);
        this.whitelists = new WhitelistsService(this.request);
    }
}

