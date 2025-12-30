/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import type { BaseHttpRequest } from "../core/BaseHttpRequest";
export class RecruitmentService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Player recruitment
   * Gets a paginated list of recruitment posts for players.
   * @param country Returns only recruitment posts of a specific country.
   * @param _class Returns only recruitment posts of a specific class.
   * Can be provided as string or as a list.
   * In order to search for multiple classes, provide the argument in an array/list format.
   * @param skill Returns only recruitment posts for a certain skill level.
   * Can be provided as string or as a list.
   * In order to search for multiple skill levels, provide the argument in an array/list format.
   * @param type Limit recruitment posts by team type.
   * @param user Limit recruitment posts by ETF2L user id. Is the creator of the post.
   * @param contentType
   * @param accept
   * @returns any
   * @throws ApiError
   */
  public getRecruitmentPlayers(
    country?: string,
    _class?: Array<string>,
    skill?: Array<string>,
    type?: string,
    user?: number,
    contentType?: string,
    accept?: string,
  ): CancelablePromise<{
    recruitment?: Record<string, any>;
    status?: Record<string, any>;
  }> {
    return this.httpRequest.request({
      method: "GET",
      url: "/recruitment/players",
      headers: {
        "Content-Type": contentType,
        Accept: accept,
      },
      query: {
        country: country,
        class: _class,
        skill: skill,
        type: type,
        user: user,
      },
    });
  }
  /**
   * Team recruitment
   * Gets a paginated list of recruitment posts for teams.
   * @param country Returns only recruitment posts of a specific country.
   * @param _class Returns only recruitment posts of a specific class.
   * Can be provided as string or as a list.
   * In order to search for multiple classes, provide the argument in an array/list format.
   * @param skill Returns only recruitment posts for a certain skill level.
   * Can be provided as string or as a list.
   * In order to search for multiple skill levels, provide the argument in an array/list format.
   * @param type Limit recruitment posts by team type.
   * @param user Limit recruitment posts by ETF2L user id. Is the creator of the post.
   * @param contentType
   * @param accept
   * @returns any
   * @throws ApiError
   */
  public getRecruitmentTeams(
    country?: string,
    _class?: Array<string>,
    skill?: Array<string>,
    type?: string,
    user?: number,
    contentType?: string,
    accept?: string,
  ): CancelablePromise<{
    recruitment?: Record<string, any>;
    status?: Record<string, any>;
  }> {
    return this.httpRequest.request({
      method: "GET",
      url: "/recruitment/teams",
      headers: {
        "Content-Type": contentType,
        Accept: accept,
      },
      query: {
        country: country,
        class: _class,
        skill: skill,
        type: type,
        user: user,
      },
    });
  }
}
