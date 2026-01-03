/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class MatchesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get a match by ID
   * Fetches match data for a given match id
   * @param matchId
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0Matches(matchId: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/matches/{matchId}",
      path: {
        matchId: matchId,
      },
    });
  }
  /**
   * Get many matches
   * Get many matches
   * @param take
   * @param skip
   * @param requestBody
   * @returns any Default Response
   * @throws ApiError
   */
  public postV0MatchesPaged(
    take?: number,
    skip?: number,
    requestBody?: {
      before?: string;
      after?: string;
      updatedSince?: string;
    },
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "POST",
      url: "/v0/matches/paged",
      query: {
        take: take,
        skip: skip,
      },
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
