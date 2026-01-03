/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class ProfileService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Fetch a user by SteamID
   * Gets information about a given user
   * @param steamId
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0Profile(steamId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/profile/{steamId}",
      path: {
        steamId: steamId,
      },
    });
  }
  /**
   * Get player's match calendar in iCal format
   * Gets iCal calendar of upcoming matches for a player
   * @param steamId
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0ProfileCalendar(steamId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/profile/{steamId}/calendar",
      path: {
        steamId: steamId,
      },
    });
  }
  /**
   * Bulk get users by SteamID
   * Bulk endpoint for querying more than 1 profile at a time, useful in cases such as querying a list of players that played in a log
   * @param requestBody
   * @returns any Default Response
   * @throws ApiError
   */
  public postV0ProfileGetmany(
    requestBody?: Array<string>,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "POST",
      url: "/v0/profile/getmany",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * Get a user's past teams
   * Fetches previous team experience for a given user
   * @param steamId
   * @returns any Default Response
   * @throws ApiError
   */
  public getV0ProfileTeams(steamId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "GET",
      url: "/v0/profile/{steamId}/teams",
      path: {
        steamId: steamId,
      },
    });
  }
  /**
   * Search a user by alias
   * Searches player aliases where the alias contains the search string
   * @param requestBody
   * @param take
   * @param skip
   * @returns any Default Response
   * @throws ApiError
   */
  public postV0SearchPlayers(
    requestBody: {
      nameContains: string;
    },
    take?: number,
    skip?: number,
  ): CancelablePromise<any> {
    return this.httpRequest.request({
      method: "POST",
      url: "/v0/search/players",
      query: {
        take: take,
        skip: skip,
      },
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
