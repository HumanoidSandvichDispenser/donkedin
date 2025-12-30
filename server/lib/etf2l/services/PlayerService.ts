/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PlayerService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Player information
     * Gets the ETF2L user information.
     *
     * Valid arguments: ETF2L Player ID, SteamID2, SteamID3, SteamID64.
     * @param id The ID of the player.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getPlayer(
        id: string,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/player/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Player transfers
     * Gets the team transfers of a player.
     *
     * Valid parameters: ETF2L Player ID, SteamID2, SteamID3, SteamID64.
     * @param id The ID of the player.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getPlayerTransfers(
        id: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/player/{id}/transfers',
            path: {
                'id': id,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
    /**
     * Player results
     * Gets the player's results. Sorted from most recent to least recent.
     * Uses pagination. Provide a page query parameter to iterate through the results.
     *
     * Valid parameters: ETF2L Player ID, SteamID2, SteamID3, SteamID64.
     * @param id The ID of the player.
     * @param contentType
     * @param accept
     * @returns void
     * @throws ApiError
     */
    public getPlayerResults(
        id: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/player/{id}/results',
            path: {
                'id': id,
            },
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
}
