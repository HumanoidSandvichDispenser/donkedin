/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
import type { RglSeason } from "../types";
export class SeasonsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get seasonal information
   * Aggregates team and match information alongside the season information
   * @param seasonId
   * @returns RglSeason Default Response
   * @throws ApiError
   */
  public getV0Seasons(seasonId: number): CancelablePromise<RglSeason> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/seasons/{seasonId}",
      path: {
        seasonId: seasonId,
      },
    });
  }
}
