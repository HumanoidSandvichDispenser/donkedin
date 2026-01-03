/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class TeamsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Search a team by alias
   * Searches teams by their team name or team tag
   * @param requestBody
   * @param take
   * @param skip
   * @returns any Default Response
   * @throws ApiError
   */
  public postV0SearchTeams(
    requestBody: {
      nameContains: string;
    },
    take?: number,
    skip?: number,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "POST",
      url: "/v0/search/teams",
      query: {
        take: take,
        skip: skip,
      },
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * Fetch a teams information
   * Gets the public data for a given team
   * @param teamId
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0Teams(teamId: number): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/teams/{teamId}",
      path: {
        teamId: teamId,
      },
    });
  }
}
