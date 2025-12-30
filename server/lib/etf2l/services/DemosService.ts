/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DemosService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Demos
     * Returns a paginated list of all demos that were uploaded on ETF2L.
     * @param player Takes an ETF2L user ID and returns demos that were uploaded by this user.
     * @param type Use these to limit the type of demos you want to see.
     * @param pruned After x amount of time, demos are archived and are no longer available for download.
     * If you want to get only the demos that are readily available for download, use pruned=0.
     * @param from UNIX timestamp that limits results to everything after the timestamp.
     * @param to UNIX timestamp that limits results to everything before the time.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getDemos(
        player?: number,
        type?: string,
        pruned?: boolean,
        from?: number,
        to?: number,
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        demos?: Record<string, any>;
        status?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/demos',
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
            query: {
                'player': player,
                'type': type,
                'pruned': pruned,
                'from': from,
                'to': to,
            },
        });
    }
}
