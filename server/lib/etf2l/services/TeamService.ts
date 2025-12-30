/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TeamService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Team
     * Shows information about an ETF2L team.
     * Information includes competitions, current active players and details.
     * @param clanId The ID of the clan.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getTeam(
        clanId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/team/{clan_id}',
            path: {
                'clan_id': clanId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Team transfers
     * Gets the transfers of a team.
     * @param clanId The ID of the clan.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getTeamTransfers(
        clanId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/team/{clan_id}/transfers',
            path: {
                'clan_id': clanId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Team results
     * Gets the team's results.
     * @param clanId The ID of the clan.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getTeamResults(
        clanId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/team/{clan_id}/results',
            path: {
                'clan_id': clanId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Team matches
     * Returns a list of matches the team has played in, from most to least recent.
     *
     * Requires a ETF2L team ID.
     * @param clanId The ID of the clan.
     * @param clan1 Team ID of the blu team.
     * @param clan2 Team ID of the red team.
     * @param vs Team ID of either team.
     * @param scheduled If set to 1, returns matches that have yet to be played. If set to 0, returns matches that are over.
     * @param competition Limit your search to a specific competition. Expects a competition ID.
     * @param from UNIX timestamp that limits results to everything after the timestamp.
     * @param to UNIX timestamp that limits results to everything before the time.
     * @param division Name of the division in which the competition was played.
     * @param teamType Name of the type of team.
     * @param round Name of the current round.
     * @param stringArray players A list of ETF2L user ID's. Returns only matches in which any of the provided players participated.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getTeamMatches(
        clanId: number,
        clan1?: number,
        clan2?: number,
        vs?: number,
        scheduled?: number,
        competition?: number,
        from?: number,
        to?: number,
        division?: string,
        teamType?: string,
        round?: string,
        stringArray?: string,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/team/{clan_id}/matches',
            path: {
                'clan_id': clanId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
            query: {
                'clan1': clan1,
                'clan2': clan2,
                'vs': vs,
                'scheduled': scheduled,
                'competition': competition,
                'from': from,
                'to': to,
                'division': division,
                'team_type': teamType,
                'round': round,
                'string[]': stringArray,
            },
        });
    }
}
