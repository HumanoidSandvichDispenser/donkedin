/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CompetitionService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Competition overview
     * Gets a list of all competitions.
     * @param archived 1 Returns only archived competitions, 0 returns non-archived competitions.
     * @param name Search by name.
     * @param description Search by description.
     * @param category Search by kind of competition.
     * @param compType Search by competition format.
     * @param teamType Search by team type.
     * @param competition Search by a specific competition ID.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetitionList(
        archived?: number,
        name?: string,
        description?: string,
        category?: string,
        compType?: string,
        teamType?: string,
        competition?: string,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        competitions?: Record<string, any>;
        status?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/list',
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
            query: {
                'archived': archived,
                'name': name,
                'description': description,
                'category': category,
                'comp_type': compType,
                'team_type': teamType,
                'competition': competition,
            },
        });
    }
    /**
     * Competition details
     * Provides some extra details on the competition.
     * Extra information includes the map pool & total signups.
     * @param competitionId The ID of the competition.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetition(
        competitionId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        competition?: Record<string, any>;
        status?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/{competition_id}',
            path: {
                'competition_id': competitionId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Competition teams
     * Returns a paginated list of teams that participated in the competition.
     * Dropped teams are marked with the 'drop' parameter.
     * @param competitionId The ID of the competition.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetitionTeams(
        competitionId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        status?: Record<string, any>;
        teams?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/{competition_id}/teams',
            path: {
                'competition_id': competitionId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Competition results
     * Gets a paginated list of all match results for this competition, ordered from most to least recent.
     * @param competitionId The ID of the competition.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetitionResults(
        competitionId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        results?: Record<string, any>;
        status?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/{competition_id}/results',
            path: {
                'competition_id': competitionId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Competition matches
     * Gets a paginated list of all matches for this competition, ordered from most to least recent.
     * The main difference with the competition results API is that matches do not have to be played yet in order
     * to appear in this list.
     * @param competitionId The ID of the competition.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetitionMatches(
        competitionId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        matches?: Record<string, any>;
        status?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/{competition_id}/matches',
            path: {
                'competition_id': competitionId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Competition tables
     * This endpoint returns the same data that is used to show the tables if you navigate to 'Competitions' -> {the competition} Tables.
     *
     * drop marks if a team was dropped from the competition.
     * gc_ stands for Golden Cap and covers both Golden Cap wins and losses.
     * penalty_points are assigned when a team has contracted a certain amount of warnings (see ETF2L General Rules for more information)
     * ach (short for achievement) indicates the placement of the teams at the end of a season.
     * The tables are grouped by division names respectively. The order in which they are sorted indicates their placements.
     * Dropped teams will always be at the bottom, while teams that finished top 3 will always be first even if they had overall less score in the main season.
     *
     * Note that one season might have multiple competitions internally. This is usually the case for regular tiers vs top tiers.
     * @param competitionId The ID of the competition.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getCompetitionTables(
        competitionId: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        tables?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/competition/{competition_id}/tables',
            path: {
                'competition_id': competitionId,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
}
