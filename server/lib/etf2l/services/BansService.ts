/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class BansService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Bans
   * Returns a paginated list of all bans that were performed on ETF2L.
   * @param player Takes an ETF2L user ID and returns bans that were given to a user.
   * @param status Can be either 'active' or 'expired'.
   * @param reason Filter by the reason of the ban.
   * @param contentType
   * @param accept
   * @returns any
   * @throws ApiError
   */
  public getBans(
    player?: number,
    status?: string,
    reason?: string,
    contentType?: string,
    accept?: string,
  ): CancelablePromise<{
    bans?: Record<string, any>;
  }> {
    return this.httpRequest.request({
      method: "GET",
      url: "/bans",
      headers: {
        "Content-Type": contentType,
        Accept: accept,
      },
      query: {
        player: player,
        status: status,
        reason: reason,
      },
    });
  }
}
