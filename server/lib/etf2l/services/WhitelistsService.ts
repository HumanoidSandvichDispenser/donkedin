/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class WhitelistsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Whitelists
     * Returns a list of all whitelists currently maintained by ETF2L.
     * @param contentType
     * @param accept
     * @returns any
     * @throws ApiError
     */
    public getWhitelists(
        contentType?: string,
        accept?: string,
    ): CancelablePromise<{
        status?: Record<string, any>;
        whitelists?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/whitelists',
            headers: {
                'Content-Type': contentType,
                'Accept': accept,
            },
        });
    }
}
